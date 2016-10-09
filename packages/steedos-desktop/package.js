Package.describe({
    name: 'steedos:desktop',
    version: '3.1.0',
    summary: 'Steedos Desktop',
    git: ''
});

Package.onUse(function(api) { 
    api.versionsFrom("1.2.1");

    api.use('reactive-var');
    api.use('reactive-dict');
    api.use('coffeescript');
    api.use('random');
    api.use('ddp');
    api.use('check');
    api.use('ddp-rate-limiter');
    api.use('underscore');
    api.use('tracker');
    api.use('session');
    api.use('blaze');
    api.use('templating');
    api.use('webapp', 'server');
    api.use('steedos:lib@0.0.1');


    //api.add_files("package-tap.i18n", ["client", "server"]);
    api.addFiles('apps/vendor/nw-boilerplate/menu.js');
   
});

Package.onTest(function(api) {

});