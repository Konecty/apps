JsonRoutes.add 'post', '/api/workflow/remove', (req, res, next) ->
	try
		current_user_info = uuflowManager.check_authorization(req)
		current_user = current_user_info._id

		hashData = req.body

		inserted_instances = new Array

		_.each hashData['Instances'], (instance_from_client) ->
			# 获取一个instance
			instance = uuflowManager.getInstance(instance_from_client["id"])
			space_id = instance.space
			# 获取一个space
			space = uuflowManager.getSpace(space_id)
			# 获取一个space下的一个user
			space_user = uuflowManager.getSpaceUser(space_id, current_user)
			# 判断一个用户是否是一个instance的提交者或者申请人 或SpaceAdmin或FlowAdmin
			permissions = permissionManager.getFlowPermissions(instance.flow, current_user)
			if (instance.submitter isnt current_user) and (not space.admins.includes current_user ) and (not permissions.includes "admin")
				throw new  Meteor.Error('error!', "您不能删除此申请单。")

			delete_obj = db.instances.findOne(instance_from_client["id"])
			delete_obj.deleted = new Date
			delete_obj.deleted_by = current_user

			db.deleted_instances.insert(delete_obj)

			# 删除instance
			db.instances.remove(instance_from_client["id"])

			if delete_obj.state isnt "draft"
				#发送给待处理人, #发送给被传阅人
				inbox_users = if delete_obj.inbox_users then delete_obj.inbox_users else []
				cc_users = if delete_obj.cc_users then delete_obj.cc_users else []
				user_ids = _.uniq(inbox_users.concat(cc_users))
				_.each user_ids, (u_id)->
					pushManager.send_message_to_specifyUser("terminate_approval", u_id)

				# 发送删除通知邮件给通过校验的申请人/填单人，对申请人/填单人各生成一条smtp message
				pushManager.send_instance_notification("monitor_delete_applicant", delete_obj, "", current_user_info)

		JsonRoutes.sendResult res,
			code: 200
			data: { inserts: inserted_instances}
	catch e
		console.error e.stack
		JsonRoutes.sendResult res,
			code: 200
			data: { errors: [{errorMessage: e.message}]}
	
		