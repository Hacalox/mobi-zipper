'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mobi = function () {
  function Mobi() {
    _classCallCheck(this, Mobi);

    this.options = {
      input: null,
      output: null,
      clean: null,
      modified: null,
      bookname: null,
      bookpath: null,
      calibre: null,
      flags: ['--mobi-file-type=both', '--disable-font-rescaling', '--no-inline-toc']
    };
  }

  _createClass(Mobi, [{
    key: '_set',
    value: function _set(key, val) {
      this.options[key] = val;
      return this.options[key];
    }
  }, {
    key: '_get',
    value: function _get(key) {
      return this.options[key];
    }
  }, {
    key: 'report',
    value: function report(err, stdout, stderr, reject) {
      if (err) {
        reject(err);
      }
      if (stderr !== '') {
        reject(new Error(stderr));
      }
      if (stdout !== '') {
        console.log(stdout);
      } // eslint-disable-line no-console
      return;
    }
  }, {
    key: 'checkForCalibre',
    value: function checkForCalibre() {
      var _this = this;

      var calibrepath = '/Applications/calibre.app/Contents/MacOS/ebook-convert';
      return new Promise(function (resolve, reject) {
        return (0, _child_process.exec)('hash ebook-convert 2>/dev/null', function (err1, stdout1, stderr1) {
          if (err1) {
            reject(err1);
          }
          if (stdout1 !== '') {
            console.log(stdout1);
          } // eslint-disable-line no-console
          if (stderr1 === '' && !err1) {
            _this._set('calibre', 'ebook-convert');
            resolve();
          }
          if (stderr1 !== '' && !err1) {
            (0, _child_process.exec)('[ -e "' + calibrepath + '" ] 2>/dev/null', function (err2, stdout2, stderr2) {
              if (err2) {
                reject(err2);
              }
              if (stdout2 !== '') {
                console.log(stdout2);
              } // eslint-disable-line no-console
              if (stderr2 !== '') {
                reject(new Error({ message: ['calibre is required to convert this book.', 'Download it here: https://calibre-ebook.com/'].join(' ') }));
              }
              if (stderr2 === '' && !err2) {
                _this._set('calibre', calibrepath);
                resolve();
              }
            });
          }
        });
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      return ['mobis=`ls -1 ' + this._get('output') + '/*.mobi 2>/dev/null | wc -l`;', 'if [ $mobis != 0 ]; then rm ' + this._get('output') + '/*.mobi; fi'].join(' ');
    }
  }, {
    key: 'compile',
    value: function compile() {
      return [this._get('calibre'), this._get('input'), this._get('bookpath'), this._get('flags').join(' ')].join(' ');
    }
  }, {
    key: 'run',
    value: function run(cmd, dir) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        (0, _child_process.exec)(_this2[cmd](), { cwd: dir }, function (err, stdout, stderr) {
          _this2.report(err, stdout, stderr, reject);
          resolve();
        });
      });
    }
  }, {
    key: 'conditionally',
    value: function conditionally(test, callback) {
      return new Promise(function (resolve /* , reject */) {
        if (test) {
          return callback.then(resolve);
        } else {
          resolve();
        }
      });
    }
  }, {
    key: 'create',
    value: function create(_ref) {
      var _this3 = this;

      var args = _objectWithoutProperties(_ref, []);

      Object.assign(this.options, args);
      var required = ['input', 'output'];

      required.forEach(function (_) {
        if (!_this3.options[_] || !{}.hasOwnProperty.call(_this3.options, _)) {
          throw new Error('Missing required argument: `' + _ + '`');
        }
      });

      if (!_path2.default.extname(this._get('input'))) {
        throw new Error('Input file must have an extension.');
      }

      this._set('bookpath', '"' + _path2.default.resolve(this._get('output'), this._get('bookname')) + '"');

      return new Promise(function (resolve /* , reject */) {
        return _this3.checkForCalibre().catch(function (err) {
          if (err) {
            console.error(err); // eslint-disable-line no-console
            process.exit();
          }
        }).then(function () {
          return _this3.run('compile', { dir: _this3._get('input') });
        }).catch(function (err) {
          return console.error(err);
        }) // eslint-disable-line no-console
        .then(resolve);
      });
    }
  }]);

  return Mobi;
}();

var mobi = new Mobi();
exports.default = mobi;
