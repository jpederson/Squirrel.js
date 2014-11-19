## Squirrel.js

Store form values in HTML5 sessionStorage automatically as the user types with this jQuery plugin.

To get started, simply include the plugin after your jQuery library is loaded, and add a class of `squirrel` to your form. The plugin does its own bindings for that class, otherwise you can set it up to target your forms using the code below:

```js
$(".my-form").squirrel();
```

#### [Demo](http://squirreljs.com)
#### [Documentation](https://github.com/jpederson/Squirrel.js/wiki)

See the documentation to learn about advanced configuration options, including using localStorage instead of sessionStorage.

*****

### Browser Support

Browser support for both sessionStorage and JSON (required to parse/stringify data for session storage) are quite deep. If there's no support, the plugin does nothing.

- Internet Explorer 8+
- Firefox 28+
- Chrome 31
- Safari (OSX) 5.1+
- Safari (iOS) 4.0+
- Android 2.1+

*****

### Contributing

To contribute, you'll need [nodejs](http://nodejs.org/) and [Grunt](http://gruntjs.com/) installed. Fork and clone the repo, then visit the directory in the terminal and type `npm install`. After that you can simply run the `grunt` command to watch the files in the project. It'll automatically lint, test, compile, and minify the plugin files so you can just code.

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
