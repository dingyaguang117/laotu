/**
 * Created by ding on 15/9/26.
 */

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}



function get_host(url){
    var p_host = new RegExp('^.*?//([^/]+)');
    var special_suffix = ['.com.cn', '.edu.cn', '.org.cn', '.net.cn']
    var host;
    var ori_host = url.match(p_host)[1];
    var segs = ori_host.split('.');

    host = segs[segs.length-2] + '.' + segs[segs.length-1];
    special_suffix.forEach(function(suffix){
        if(ori_host.endsWith(suffix)){
            host = segs[segs.length-3] + '.' + host;
        }
    })
    return host
}