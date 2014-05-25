## Squirrel.js

Store form values in HTML5 sessionStorage automatically as the user types with this jQuery plugin.

To get started, simply include the plugin after your jQuery library is loaded, and add a class of `squirrel` to your form. The plugin does its own bindings for that class, otherwise you can set it up to target your forms using the code below:

```js
$(".my-form").squirrel();
```

#### [Demo](http://squirreljs.com)
#### [Documentation](https://github.com/jpederson/Squirrel.js/wiki)

*****

### Browser Support

Browser support for both sessionStorage and JSON (required to parse/stringify data for session storage) are quite deep. If there's no support, the plugin does nothing.

- Internet Explorer 8+
- Firefox 28+
- Chrome 31
- Safari (OSX) 5.1+
- Safari (iOS) 4.0+
- Android 2.1+