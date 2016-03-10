/**
 * Created by ding on 15/9/20.
 */


function draw_pv_uv(dates, pvs, uvs){
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
            {name: 'PV', data: pvs },
            {name: 'UV', data: uvs },
        ]
    });
}

function query_website_info(url){
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
                info.title = tree.find('div:contains(网站基本信息)').parent().next().text();

                try {
                    info.baidu_weight = tree.find('span:contains(百度权重：)').next().find('img').attr('src').match(p_baidu_weight);
                    info.baidu_weight = info.baidu_weight != null ? info.baidu_weight[1] : 0;
                }catch(e){
                    info.baidu_weight = -1;
                }

                try{
                    info.google_pr = tree.find('span:contains(Google：)').next().find('img').attr('src').match(p_google_pr);
                    info.google_pr = info.google_pr != null ? info.google_pr[1] : 0;
                }catch(e){
                    info.google_pr = -2;
                }

                info.ip = tree.find('div[class="brn ipmW"] a').text();

                info.domain_age = tree.find('a:contains(域名年龄)').parent().next().find('a').text()
                info.beian = tree.find('td[title="\u57df\u540d\u5907\u6848"]').next().text();

                console.log(info)
                $('#basic-info').html(template('basic-info-template', info));
            }
        });
    }

    var crawl_laoniu = function(){
        var begin_date = moment().add(-8, 'days').format('YYYY-MM-DD 00:00:00');
        var end_date = moment().add(-2, 'days').format('YYYY-MM-DD 23:59:59');

        $.post('http://www.laoniushuju.com/sitepvuv/seven', {domain: host, beginDate: begin_date, endDate: end_date}, function(data){
            var dates = [];
            var pvs = [];
            var uvs = [];

            data['data']['pv']['series'].forEach(function(pv){
                dates.push(pv.xdate.slice(5));
                pvs.push(pv.value)
            })

            data['data']['uv']['series'].forEach(function(uv){
                uvs.push(uv.value)
            })

            if(pvs.length == 0){
                $.post('http://www.laoniushuju.com/topn/site', {domain: host, beginDate: begin_date, endDate: end_date}, function (data) {
                    var dates = [];
                    var pvs = [];
                    data['data']['pv \u6570\u636e']['series'].forEach(function(pv){
                        dates.push(pv.xdate.slice(5));
                        pvs.push(pv.value)
                    })
                    draw_pv_uv(dates, pvs, []);
                });
            }else
            {
                draw_pv_uv(dates, pvs, uvs);
            }
        })
    }

    crawl_chinaz();
    crawl_laoniu();
}



$(function() {
  get_current_tab_url(query_website_info);
});



