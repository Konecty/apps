db.flows.adminConfig = 
	icon: "globe"
	color: "blue"
	tableColumns: [
		{name: "name"},
		{name: "instance_style"},
	]
	selector: Admin.selectorCheckSpaceAdmin
	showDelColumn: false
	routerAdmin: "/admin"


db.flow_roles.adminConfig = 
	icon: "users"
	color: "green"
	label: ->
		return t("flow_roles")
	tableColumns: [
		{name: "name"},
	]
	extraFields: []
	newFormFields: "space,name"
	selector: Admin.selectorCheckSpaceAdmin
	pageLength: 100



db.flow_positions.adminConfig = 
	icon: "users"
	color: "green"
	label: ->
		return t("flow_positions")
	tableColumns: [
		{name: "role_name()"},
		{name: "org_name()"},
		{name: "users_name()"},
	]
	extraFields: ["space", "role", "org", "users"]
	newFormFields: "space,role,org,users"
	pageLength: 100
	selector: Admin.selectorCheckSpaceAdmin 
	children: [
		{ 
			find: (position) ->
				@unblock()
				# Publish the related flow_roles
				db.flow_roles.find { _id: position.role }, fields: name: 1
		}
		{ 
			find: (position) ->
				@unblock()
				# Publish the related organizations
				db.organizations.find { _id: position.org }, fields: fullname: 1
		}
		{ 
			find: (position) ->
				@unblock()
				# Publish the related user
				db.space_users.find {
					space: position.space
					user: $in: position.users
				}, fields:
					space: 1
					user: 1
					name: 1
		}
	]


Meteor.startup ->

	@flows_template = db.flows
	@flow_roles = db.flow_roles
	@flow_positions = db.flow_positions
	AdminConfig?.collections_add
		flows_template: db.flows.adminConfig
		flow_positions: db.flow_positions.adminConfig
		flow_roles: db.flow_roles.adminConfig

