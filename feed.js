var debug = require('debug')('btn-autodl');
var FeedParser = require('feedparser');
var https = require('https');
var path = require('path');
var objectAssign = require('object-assign');

var opts = Object.assign({}, {
  POLL_INTERVAL: 60000 * 10,
  TORRENT_DIR: process.cwd()
}, process.env);

if (!opts.FEED_URL) throw new Error('No FEED_URL env var provided!');

var SHOW_MATCHERS = [

  function HDTVMatcher (item) {
    if (
      (
        /^Arrow/.exec(item.title)
        || /^The Flash/i.exec(item.title)
        || /^Star Wars Rebels/i.exec(item.title)
        || /^Supergirl/i.exec(item.title)
        || /^Ash vs Evil Dead/i.exec(item.title)
        || /^Marvel's Agents of S/i.exec(item.title)
        || /^Doctor Who \(2005\)/i.exec(item.title)
        || /^Supernatural/i.exec(item.title)
      )
      && if720pHDTV(item.title)
    ) {
      debug('matched %s', item.title);
      dlTorrent(item.link);
    }
  }

];

function if720pHDTV (x) {
  return /720p\.HDTV/gi.exec(x);
}

function dlTorrent (url) {
  var fs = require('fs');
  debug('GET ' + url);
  https.get(url, function (res) {
    var filename = res.headers['content-disposition']
      .replace('attachment; Filename=', '')
      .replace(/"/g, '');
    var filepath = path.join(opts.TORRENT_DIR, filename);
    debug('dl %s', filepath);
    res.pipe(fs.createWriteStream(filepath));
  });
}

(function check() {
  var fp = new FeedParser();
  fp.on('readable', function () {
    var stream = this;
    var meta = this.meta;
    var item;
    while (item = stream.read()) {
      SHOW_MATCHERS.forEach(function (matcher) {
        matcher(item);
      });
    }
  });
  debug('retrieving feed');
  https
  .get(opts.FEED_URL, function (res) { res.pipe(fp); })
  .on('error', function (err) { debug(err.message); });
  setTimeout(check, opts.POLL_INTERVAL);
}());
