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
                var iframe = $('iframe')[0];
                var chinaz_url = 'http://seo.chinaz.com/?host=' + host;
                if(iframe.src != chinaz_url){
                    iframe.src = chinaz_url;
                }
                setTimeout(crawl_chinaz, 3000);
            }else{
                info.title = tree.find('tr:eq(1) td').text();

                try {
                    info.baidu_weight = tree.find('td[title="Seo\u4fe1\u606f"]').next().find('span:eq(0) a img').attr('src').match(p_baidu_weight);
                    info.baidu_weight = info.baidu_weight != null ? info.baidu_weight[1] : 0;
                }catch(e){
                    info.baidu_weight = -1;
                }

                try{
                    info.google_pr = tree.find('#pr img').attr('src').match(p_google_pr);
                    info.google_pr = info.google_pr != null ? info.google_pr[1] : 0;
                }catch(e){
                    info.google_pr = -2;
                }

                info.ip = tree.find('td[title="\u57df\u540dIP"]').next().text();

                info.domain_age = tree.find('td[title="\u57df\u540d\u5e74\u9f84"]').next().text();
                info.beian = tree.find('td[title="\u57df\u540d\u5907\u6848"]').next().text();

                console.log(info)
                $('#basic-info').html(template('basic-info-template', info));
            }



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
                dates.push(pv.xdate.slice(5));
                values.push(pv.value)
            })
            drawPv(dates, values);
        });
    }

    crawl_chinaz();
    crawl_laoniu();
}



$(function() {
  getCurrentTabUrl(queryWebsiteInfo);
});



