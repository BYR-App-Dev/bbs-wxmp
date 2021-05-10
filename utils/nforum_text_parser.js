const app = getApp();
const bbPattern = /\[(.+?)(=.*?)?\]((?:.|[\n\r])*?)\[\/\1\]/g;
const quotePattern = /\n*【 ?在(.*)的大作中提到: ?】 ?(\n:.*)*/g;
const bbsEmojiPattern = /\[bbsemoji([0-9|,]*?)\]/g;
const emPattern = /\[em([abc]?)(.+?)\]/g;
const bbCode = {
  "b": 1,
  "i": 1,
  "u": 1,
  "size": 1,
  "color": 1,
  "md": 1,
  // "mp3": 1,
};
module.exports = {
  appendOAuthToken(url) {
    return url + "oauth_token=" + app.globalData.accessToken;
  },
  stripText(str) {
    let strs = str;
    let bb = [
      "\\[\\/?b\\]",
      '\\[\\/?i\\]',
      '\\[\\/?u\\]',
      '\\[size=.*?\\]',
      '\\[\\/size\\]',
      '\\[color=.*?\\]',
      '\\[\\/color\\]',
      '\\[\\/?md\\]',
      '\\[em.*?\\]',
      "\\[upload=.*?\\]",
      "\\[\\/upload\\]",
    ];

    let nstr = str;
    for (let b of bb) {
      nstr = nstr.replace(new RegExp(b, 'g'), "");
    }
    return nstr;
  },
  parseEmojiBBCodeString(str) {
    function extractEmojiCodes(bbcodeInnerContent) {
        return bbcodeInnerContent.split(',').map(emojiCode => parseInt(emojiCode));
    }
    function stringFromUnicodeValues(unicodeValues) {
        return String.fromCharCode(...unicodeValues);
    }
    function extractEmojisFromBBCode(match, p1, offset, origin) {
        return stringFromUnicodeValues(extractEmojiCodes(p1));
    }
    return str.replace(bbsEmojiPattern, extractEmojisFromBBCode);
  },
  nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  },
  bbText(k, parsedcontent) {
    parsedcontent = parsedcontent.replace(bbPattern, (g1, g2, g3, g4) => {
      if(bbCode[g2]) {
        switch(g2) {
          case "b":
            return `<b>${this.bbText(k, g4)}</b>`;
          case "i":
            return `<i>${this.bbText(k, g4)}</i>`;
          case "u":
            return `<u>${this.bbText(k, g4)}</u>`;
          case "size":
              return `<font size=${parseInt(g3.substring(1)) * 2}>${this.bbText(k, g4)}</font>`;
          case "color":
            return `<font color=${g3.substring(1)}>${this.bbText(k, g4)}</font>`;
          default:
            return this.bbText(k, g4);
        }
      }else if(g2 == "upload") {
        let ind = parseInt(g3.substring(1));
        if(k.attachment.file && ind != NaN && ind <= k.attachment.file.length) {
          k.attachment.file[ind - 1].used = true;
          if(k.attachment.file[ind - 1].name.match(/(jpg|png|gif)$/)) {
            return `<p><img src=${this.appendOAuthToken(k.attachment.file[ind - 1].thumbnail_middle + "?")} original-src=${this.appendOAuthToken(k.attachment.file[ind - 1].url + "?")}></img></p>`;
          }else if(k.attachment.file[ind - 1].name.match(/(mp3|m4a|aac)$/)) {
            return `<p><audio controls name=${k.title} author=${k.user.id} src=${this.appendOAuthToken(k.attachment.file[ind - 1].url + "?")}></audio></p>`;
          }else {
            return "";
          }
        }else {
          return "";
        }
      }if(g2 == "img") {
        let imgAddr = g3.substring(1);
        return `<p><img src=${imgAddr}></img></p>`;
      }else {
        return "";
      }
    });
    return parsedcontent;
  },
  splitMarkdown(parsedcontent) {
    let current = 0;
    let txtblocks = [];
    let iterator = parsedcontent.matchAll(/\[md\]((?:.|[\n\r])+?)\[\/md\]/g);
    let theMD = iterator.next();

    while (!theMD.done && theMD.value !== ' ') {
      if(current < theMD.value.index) {
        txtblocks.push({starter: current, ender: theMD.value.index, ismd: false});
      }
      txtblocks.push({starter: theMD.value.index + 4, ender: theMD.value.index + theMD.value[0].length - 5, ismd: true});
      current = theMD.value.index + theMD.value[0].length;
      theMD = iterator.next();
    }
    if(current < parsedcontent.length) {
      txtblocks.push({starter: current, ender: parsedcontent.length, ismd: false});
    }
    return txtblocks;
  },
  parseText(k) {
    let parsedcontent = k.content;
    let txtblocks = this.splitMarkdown(parsedcontent);
    let parsedTextBlocks = [];
    for(let tb of txtblocks) {
      if(tb.ismd) {
        let rtxt = parsedcontent.substring(tb.starter, tb.ender).trim();
        parsedTextBlocks.push({ismd: true, content: rtxt});
      }else {
        let rtxt = parsedcontent.substring(tb.starter, tb.ender).trim();
        rtxt = rtxt.replace(quotePattern, (g1, g2, g3) => {
          return "<p style='background-color:#fafafa;color:#9e9e9e'>" + this.stripText(g1).trim() + "</p>";
        });
        rtxt = this.parseEmojiBBCodeString(rtxt).replace(emPattern, "<img src=https://bbs.byr.cn/img/ubb/em$1/$2.gif ignore></img>");
        rtxt = this.nl2br(this.bbText(k, rtxt));
        parsedTextBlocks.push({ismd: false, content: rtxt});
      }
    }

    let appenderStr = "";
    if(k.attachment.file) {
      for(let fi = 0; fi < k.attachment.file.length; ++fi) {
        if(k.attachment.file[fi].used) {

        }else {
          appenderStr = appenderStr + `[upload=${fi + 1}][/upload]`;
        }
      }
    }
    if(appenderStr.length > 0) {
      let rtxt = this.bbText({user: k.user, title: k.title, content: appenderStr, attachment: k.attachment}, appenderStr);
      parsedTextBlocks.push({ismd: false, content: rtxt});
    }
    return parsedTextBlocks;
  },

  removeQuote(c) {
    let rtxt = c.trim().replace(quotePattern, (g1, g2, g3) => {
      return "\n";
    }).replace(/\n+/, '\n');
    return rtxt;
  },

  getTimeString(datetime) {
    return `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate()} ${datetime.getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }).padStart(2, '0')}:${datetime.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }).padStart(2, '0')}`;
  }
}