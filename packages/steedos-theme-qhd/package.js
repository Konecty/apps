Package.describe({
    name: 'steedos:theme-qhd',
    version: '0.0.1',
    summary: 'Steedos theme for qhd',
    git: ''
});

Package.onUse(function(api) { 
    api.versionsFrom('1.0');
    api.use('flemay:less-autoprefixer@1.2.0');
    api.use('tap:i18n@1.7.0');
    api.use('tap:i18n', ['client', 'server']);

    api.use('steedos:workflow');

    tapi18nFiles = ['i18n/en.i18n.json', 'i18n/zh-CN.i18n.json']
    api.addFiles(tapi18nFiles, ['client', 'server']);

    api.addFiles("client/customize.less", "client");
    // EXPORT
    
});

Package.onTest(function(api) {

});
