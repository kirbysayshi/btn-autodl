var debug = require('debug')('btn-autodl');
var FeedParser = require('feedparser');
var https = require('https');
var path = require('path');
var objectAssign = require('object-assign');

var opts = Object.assign({}, {
  POLL_INTERVAL: 60000 * 10,
  TORRENT_DIR: process.cwd(),
  FILTERS: 'path/to/filter/file.js'
}, process.env);

if (!opts.FEED_URL) throw new Error('No FEED_URL env var provided!');

var matcher = require(opts.FILTERS);

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
  fp.on('error', function (e) {
    process.stderr.write(JSON.stringify(e));
  });
  fp.on('readable', function () {
    var stream = this;
    var meta = this.meta;
    var item;
    while (item = stream.read()) {
      if (matcher(item)) {
        debug('matched %s', item.title);
        dlTorrent(item.link);
      }
    }
  });
  debug('retrieving feed');
  https
  .get(opts.FEED_URL, function (res) { res.pipe(fp); })
  .on('error', function (err) { debug(err.message); });
  setTimeout(check, opts.POLL_INTERVAL);
}());
