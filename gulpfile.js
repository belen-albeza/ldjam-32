// IMPORTANT
// edit gulp.config.json and customize there your deployment settings

'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge-stream');

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');

var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var rsync = require('gulp-rsync');

var config = {};
try {
    config = require('./gulp.config.json');
}
catch (e) {
    console.warn('Edit or create gulp.config.json to customize your ' +
    'deployment settings.');
}


//
// browserify and js
//

var bundler = browserify([
    './app/js/main.js'
]);

var bundle = function ()  {
    return bundler
    .bundle()
    .on('error', gutil.log)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('.tmp/js/'))
    .pipe(livereload());
};


gulp.task('browserify', bundle);

// 3rd party libs that don't play nice with browserify
gulp.task('libs', function () {
    var dir = './node_modules/phaser/build/';
    gulp.src(['phaser.min.js', 'phaser.map'], { cwd: dir, base: dir})
    .pipe(gulp.dest('./.tmp/js/lib/'));
});

gulp.task('js', ['browserify', 'libs']);


//
// web server
//

gulp.task('connect', function () {
    connect.server({
        root: ['app', '.tmp']
    });
});


//
// build and deploy
//

gulp.task('build', ['js']);

gulp.task('copy', function () {
    let rawFiles = gulp.src([
        'index.html', 'raw.html',
        '*.css', '*.svg',
        'images/**/*', 'fonts/**/*', 'audio/**/*', 'data/**/*'
    ], { cwd: './app', base: './app' })
    .pipe(gulp.dest('./dist/'));

    let builtFiles = gulp.src(['js/**/*'], { cwd: '.tmp', base: '.tmp' })
    .pipe(gulp.dest('./dist/'));

    return merge(rawFiles, builtFiles);
});

gulp.task('dist', ['build', 'copy']);

gulp.task('deploy', ['dist'], function () {
    return gulp.src('dist')
    .pipe(rsync({
        root: 'dist',
        username: config.deploy.user,
        hostname: config.deploy.host,
        destination: config.deploy.destination,
        recursive: true,
        clean: true,
        progress: true,
        incremental: true
    }));
});

//
// dev tasks
//

gulp.task('watch', ['connect'], function () {
    livereload.listen();

    bundler = watchify(bundler, watchify.args);
    bundler.on('update', bundle);
});

gulp.task('run', ['build', 'watch']);

//
// default task
//

gulp.task('default', ['build', 'connect']);
