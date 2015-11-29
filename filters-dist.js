module.exports = function (item) {
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
    return true;
  }
}

function if720pHDTV (x) {
  return /720p\.HDTV/gi.exec(x);
}
