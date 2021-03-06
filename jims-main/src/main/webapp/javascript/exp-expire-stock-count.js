/**
 * Created by wangbinbin on 2015/10/8.
 */
/***
 * 产品过期查询
 */
function formatterDate(val, row) {
    if (val != null) {
        var date = new Date(val);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var mm = date.getMinutes();
        var s = date.getSeconds();
        var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' '
            + (h < 10 ? ("0" + h) : h)+":"+ (mm < 10 ? ("0" + mm) : mm)+":"+ (s < 10 ? ("0" + s) : s);
        return dateTime
    }
}
function w3(s) {
    if (!s) return new Date();
    var y = s.substring(0, 4);
    var m = s.substring(5, 7);
    var d = s.substring(8, 10);
    var h = s.substring(11, 14);
    var min = s.substring(15, 17);
    var sec = s.substring(18, 20);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min) && !isNaN(sec)) {
        return new Date(y, m - 1, d, h, min, sec);
    } else {
        return new Date();
    }
}
$(function () {
    $("#dg").datagrid({
        title: '过期产品统计',
        fit: true,//让#dg数据创铺满父类容器
        toolbar:'#ft',
        footer: '#tb',
        rownumbers: true,
        singleSelect: true,
        columns: [[{
            title: '代码',
            field: 'expCode',
            align: 'center',
            width: "9%"
        }, {
            title: '产品名称',
            field: 'expName',
            align: 'center',
            width: "11%"
        },  {
            title: '产品规格',
            field: 'packageSpec',
            align: 'center',
            width: "11%"
        }, {
            title: '单位',
            field: 'packageUnits',
            align: 'center',
            width: "11%"
        }, {
            title: '厂家',
            field: 'firmId',
            align: 'center',
            width: "11%"
        }, {
            title: '批号',
            field: 'batchNo',
            align: 'center',
            width: "11%"
        }, {
            title: '有效期',
            field: 'expireDate',
            align: 'center',
            width: "11%",
            formatter : formatterDate
        },{
            title: '库存量',
            field: 'quantity',
            align: 'center',
            width: "11%",
            editor: 'numberbox'
        },{
            title: '金额',
            field: 'stockQuantity',
            align: 'right',
            width: "10%",
            editor: 'numberbox'
        }
        ]]
    });

    //var curr_time = new Date();
    //$("#overDate").datetimebox("setValue", formatterDate(curr_time))
    $('#overDate').datetimebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var time = $('#overDate').datetimebox('spinner').spinner('getValue');
            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' ' + time;
            $('#overDate').datetimebox('setText', dateTime);
            $('#overDate').datetimebox('hidePanel');
        }
    });
    //提取

    var expires = [];
    $("#searchBtn").on('click', function () {
        var overDate =$('#overDate').combo('getValue');
        if (!overDate) {
            $.messager.alert("系统提醒", "请选择截至日期", "error");
            return;
        }
        var promise = loadDict() ;
        promise.done(function(){
            if(expires.length<=0){
                $.messager.alert("系统提示", "数据库暂无数据");
                $("#dg").datagrid('loadData', []);
                return;
            }
            $("#dg").datagrid('loadData', expires);
        })

    });
    var overDates='';
    //打印
    $("#printDiv").dialog({
        title: '打印预览',
        width: 1000,
        height: 520,
        catch: false,
        modal: true,
        closed: true,
        onOpen: function () {
            var https="http://"+parent.config.reportDict.ip+":"+parent.config.reportDict.port+"/report/ReportServer?reportlet=exp/exp-list/exp-expire-stock-count.cpt"+"&hospitalId="+parent.config.hospitalId+"&storageCode="+parent.config.storageCode+"&overDate=" + overDates;
            $("#report").prop("src",cjkEncode(https));
        }
    })
    $("#printBtn").on('click', function () {
        var printData = $("#dg").datagrid('getRows');
        if (printData.length <= 0) {
            $.messager.alert('系统提示', '请先查询数据', 'info');
            return;
        }
        $("#printDiv").dialog('open');

    })
    //加载相应编码的数据
    var loadDict = function () {
        var overDate = $("#overDate").combogrid('getText');
        expires.slice(0,expires.length);
        overDates=overDate;
        var expirePromise =   $.get("/api/exp-stock/expire-count?storage=" + parent.config.storageCode+"&hospitalId="+parent.config.hospitalId+"&overDate="+overDate, function(data){
            $.each(data,function(index,item){
                item.stockQuantity = fmoney(item.stockQuantity,2);
            });
           expires = data;
        });
        return expirePromise ;
    }

    //格式化金额
    function fmoney(s, n) {
        n = n > 0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return t.split("").reverse().join("") + "." + r;
    }
})