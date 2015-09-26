/**
 * Created by ding on 15/9/20.
 */


function drawPv(dates, values){
    $('#pv-info').highcharts({
        title: {
            text: '流量数据',
            x: -20 //center
        },
        xAxis: {
            categories: dates
        },
        yAxis: {
            title: {
                text: '数据'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '次'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [
            {name: 'PV', data: values },
        ]
    });
}

function queryWebsiteInfo(url){
    info = {}
    var host = get_host(url);
    info.host = host;

    // seo.chinaz.com
    var crawl_chinaz = function() {
        $.get('http://seo.chinaz.com/?host=' + host, function (data) {
            var p_ajax = new RegExp('getJSON\\("([^"]+)"');
            var p_baidu_weight = new RegExp('/(\\d)\.gif$');
            var p_google_pr = new RegExp('_(\\d)\.gif$');

            tree = $($.parseHTML(data)).find('#seoinfo');
            if(tree.length == 0){
                console.log(data)
                var ajax_url = data.match(p_ajax)[1];
                $.get(ajax_url, function (ajax_data) {
                    if(ajax_data.indexOf('state:1') >= 0)
                        return crawl_chinaz();
                    else
                        $("#basic-info").html("获取不到Seo数据,可能是网站无法访问造成或者尝试其它模拟方式抓取");
                 });
            }

            info.title = tree.find('tr:eq(1) td').text();

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


            $('#basic-info').html(template('basic-info-template', info));
            //$('#basic-info').html(template('scan-result', info));
            crawl_laoniu();
        });
    }

    var crawl_laoniu = function(){
        var beginDate = moment().add(-8, 'days').format('YYYY-MM-DD 00:00:00');
        var endDate = moment().add(-2, 'days').format('YYYY-MM-DD 23:59:59');
        var pv_sum = 0;


        $.post('http://www.laoniushuju.com/topn/site', {domain: host, beginDate: beginDate, endDate: endDate}, function (data) {
            var dates = [];
            var values = [];
            var pvs = data['data']['pv \u6570\u636e']['series'];

            pvs.forEach(function(pv){
                dates.push(pv.xdate);
                values.push(pv.value)
            })
            drawPv(dates, values);
        });
    }

    crawl_chinaz();
}



$(function() {
  getCurrentTabUrl(queryWebsiteInfo);
});
