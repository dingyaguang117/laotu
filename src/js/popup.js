/**
 * Created by ding on 15/9/20.
 */

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

function queryWebsiteInfo(url){
    var p_host = new RegExp("^.*?//.*?([^\.]+?\.[^\.]+?)/");
    var host = url.match(p_host)[1];
    var info = {}

    // seo.chinaz.com
    var crawl_chinaz = function() {
        $.get('http://seo.chinaz.com/?host=' + host, function (data) {
            var p_baidu_weight = new RegExp('/(\\d)\.gif$');
            var p_google_pr = new RegExp('_(\\d)\.gif$');

            tree = $($.parseHTML(data)).find('#seoinfo');
            console.log(tree.prop('outerHTML'));

            try {
                info.baidu_weight = tree.find('td[title="Seo\u4fe1\u606f"]').next().find('span:eq(0) a img').attr('src').match(p_baidu_weight);
                info.baidu_weight = info.baidu_weight != null ? info.baidu_weight[1] : 0;
            }catch(e){
                info.baidu_weight = null;
            }

            try{
                info.google_pr = tree.find('#pr img').attr('src').match(p_google_pr);
                info.google_pr = info.google_pr != null ? info.google_pr[1] : 0;
            }catch(e){
                info.google_pr = null;
            }

            info.ip = tree.find('td[title="\u57df\u540dIP"]').next().text();

            info.domain_age = tree.find('td[title="\u57df\u540d\u5e74\u9f84"]').next().text();
            info.beian = tree.find('td[title="\u57df\u540d\u5907\u6848"]').next().text();

            crawl_laoniu();
        });
    }

    var crawl_laoniu = function(){
        var beginDate = moment().add(-8, 'days').format('YYYY-MM-DD 00:00:00');
        var endDate = moment().add(-2, 'days').format('YYYY-MM-DD 23:59:59');
        var pv_sum = 0;


        console.log(beginDate, endDate)

        $.post('http://www.laoniushuju.com/topn/site', {domain: host, beginDate: beginDate, endDate: endDate}, function (data) {
            console.log(data);

            var pvs = data['data']['pv \u6570\u636e']['series'];
            pvs.forEach(function(pv){
                pv_sum += pv['value'];
            })
            info['pv'] = pv_sum == 0 ? 0 : (pv_sum / pvs.length).toFixed(0);

            $('#status').text(JSON.stringify(info, null, 4));
        });
    }

    crawl_chinaz();
}



document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(queryWebsiteInfo);
});
