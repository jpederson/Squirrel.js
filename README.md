## Squirrel.js

Store form values in HTML5 sessionStorage automatically as the user types with this jQuery plugin.

To get started, simply include the plugin after your jQuery library is loaded, and add a class of `squirrel` to your form. The plugin does its own bindings for that class, otherwise you can set it up to target your forms using the code below:

```js
$('.my-form').squirrel();
```

Additionally, you may simply specify a `data-squirrel` attribute to your form with its value set to your desired `storage_key` value. This way, you can have several forms with the same input names, and they'll be stored separately in local/sessionStorage.

#### [Demo](http://squirreljs.com)
#### [Documentation](https://github.com/jpederson/Squirrel.js/wiki)

See the documentation to learn about advanced configuration options, including using localStorage instead of sessionStorage.

*****

### Supported Fields

The following types of fields are supported by Squirrel.js.

- `input[type=checkbox]`
- `input[type=color]`
- `input[type=date]`
- `input[type=datetime-local]`
- `input[type=datetime]`
- `input[type=email]`
- `input[type=month]`
- `input[type=number]` (value must be numeric to refill correctly)
- `input[type=radio]`
- `input[type=range]`
- `input[type=search]`
- `input[type=tel]`
- `input[type=text]`
- `input[type=time]`
- `input[type=url]`
- `input[type=week]`
- `textarea`
- `select`

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

### Notes

- Ignore a field by simply adding a class of `squirrel-ignore` - the plugin won't save any values that are typed into that field.
- The events used in the plugin are click, submit, blur, keyup and change. They each have a namespace of .squirrel.js e.g. keyup.squirrel.js. Therefore you can easily turn off a particular event by call .off() and the event for a specific form selector.

*****

### Contributing

To contribute, you'll need [NodeJS](http://nodejs.org/) and [Grunt](http://gruntjs.com/) installed. Fork/clone the repo, then visit the directory in the terminal and type `npm install`. After that you can simply run the `grunt` command to watch the files in the project. It'll automatically lint, test, compile, and minify the plugin files so you can just code.

[![Built with Grunt](https://gruntjs.com/cdn/builtwith.png)](http://gruntjs.com/)

*****

### Credits

These folks make this project possible, and are happy to help you integrate it into your site. Post an issue, and we're happy to help!

- @jpederson ([website](http://jpederson.com))
- @softwarespot ([website](http://softwarespot.wordpress.com/))

*****

### License

This project is proudly licensed under the MIT License

