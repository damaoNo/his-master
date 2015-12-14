/**
 * 单品总账汇总
 * Created by wangbinbin on 2015/11、02.
 */
function myFormatter2(val,row) {
    if(val!=null){
        var date = new Date(val);
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        var d = date.getDate();
        var h = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var str = y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d)+' '+(h<10?('0'+h):h)+':'+(min<10?('0'+min):min)+':'+(sec<10?('0'+sec):sec);
        return str;
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

    /**
     * 定义明细表格
     */
    $("#importDetail").datagrid({
        title: "单品总账-汇总",
        fit: true,
        fitColumns: true,
        singleSelect: true,
        showFooter:true,
        rownumbers:true,
        footer: '#ft',
        toolbar:'#tb',
        columns: [[{
            title: '方向',
            field: 'way'
        }, {
            title: '代码',
            field: 'expCode',
            width: '6%'
        }, {
            title: '产品名称',
            field: 'expName',
            width: '6%'
        }, {
            title: '类型',
            field: 'ioClass',
            width: '7%'
        }, {
            title: "科室",
            width: '7%',
            field: 'ourName'
        }, {
            title: '单位',
            field: 'packageUnits',
            width: '5%'
        }, {
            title: '厂家',
            field: 'firmId',
            width: '7%'
        }, {
            title: '批号',
            width: '5%',
            field: 'batchNo'
        } , {
            title: '入(出)库日期',
            width: '9%',
            field: 'actionDate',
            formatter: formatterDate
        }, {
            title: '失效日期',
            width: '9%',
            field: 'expireDate',
            formatter: formatterDate
        }, {
            title: "结存",
            width: '7%',
            field: 'inventory'
        }, {
            title: '单价',
            width: '5%',
            field: 'purchasePrice',
            type:'numberbox'
        }, {
            title: '入库数量',
            width: '5%',
            field: 'importNum',
            type:'numberbox'
        }, {
            title: '入库金额',
            width: '5%',
            field: 'importPrice',
            type:'numberbox'
        }, {
            title: '出库数量',
            width: '5%',
            field: 'exportNum',
            type:'numberbox'
        }, {
            title: '出库金额',
            width: '5%',
            field: 'exportPrice',
            type:'numberbox'
        }]]
    });
        //格式化日期函数
        function formatterDate(val, row) {
            if (val != null) {
                var date = new Date(val);
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                var d = date.getDate();
                var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d);
                return dateTime
            }
        }
    //设置时间
    var curr_time = new Date();
    $("#startDate").datetimebox("setValue", myFormatter2(curr_time));
    $("#stopDate").datetimebox("setValue", myFormatter2(curr_time));
    $('#startDate').datetimebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: myFormatter2,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var time = $('#startDate').datetimebox('spinner').spinner('getValue');
            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' ' + time;
            $('#startDate').datetimebox('setText', dateTime);
            $('#startDate').datetimebox('hidePanel');
        }
    });
    $('#stopDate').datetimebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: myFormatter2,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var time = $('#stopDate').datetimebox('spinner').spinner('getValue');
            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' ' + time;
            $('#stopDate').datetimebox('setText', dateTime);
            $('#stopDate').datetimebox('hidePanel');
        }
    });
    $("#searchBtn").on('click', function () {
        var promiseDetail = loadDict();
    })
    var importDetailDataVO = {};//传递vo
    var detailsData = [];//信息
    var specCodeAll =[];
    var loadDict = function(){
        importDetailDataVO.stopDate = new Date($("#stopDate").datetimebox("getText"));
        importDetailDataVO.startDate = new Date($("#startDate").datetimebox("getText"));
        importDetailDataVO.hospitalId = parent.config.hospitalId;
        importDetailDataVO.storage = parent.config.storageCode;
        var promise =$.get("/api/exp-import/exp-single-account",importDetailDataVO,function(data){
            if(data.length<=0){
                $.messager.alert('系统提示','数据库暂无数据','info');
                $("#importDetail").datagrid('loadData',[]);
                return;
            }
            var specCode ={};
            var i = 0;
            //if(specCodeAll.length<=0){
            //    specCode.expCode=data[i].expCode;
            //    specCode.expName=data[i].expName;
            //    specCode.packageSpec=data[i].packageSpec;
            //    specCodeAll.push(specCode);
            //}
            //if(specCodeAll.length>0){
            //    for(var q=0;q<data.length;q++){
            //        for(var w=0 ;w<specCodeAll.length;w++){
            //            if(data[q].expCode!=specCodeAll[w].expCode &&data[q].packageSpec!=specCodeAll[w].packageSpec&&data[q].expName!=specCodeAll[w].expName){
            //                specCode.expCode=data[q].expCode;
            //                specCode.packageSpec=data[q].packageSpec;
            //                specCodeAll.push(specCode);
            //            }
            //        }
            //    }
            //}
            //console.log(specCodeAll.length);
            if(specCodeAll.length<=0 ){
                var importPrice = 0.00;
                var exportPrice = 0.00;
                specCode.expCode=data[i].expCode;
                specCode.packageSpec=data[i].packageSpec;
                specCodeAll.push(specCode);
                for(var l = 0 ;l<data.length;l++){
                    if(data[l].expCode==specCode.expCode && data[l].packageSpec==specCode.packageSpec){
                        importPrice+=data[l].importPrice;
                        exportPrice+=data[l].exportPrice;
                        detailsData.push(data[l]);
                    }
                }
                var sp = {};
                sp.ioClass= "单品总合计：";
                sp.importPrice = importPrice;
                sp.exportPrice =exportPrice;
                detailsData.push(sp);
            }
            if(specCodeAll.length>0 ){
                var importPrice = 0.00;
                var exportPrice = 0.00;
                for(var m=0;m<data.length;m++){
                    for(var j =0;j<specCodeAll.length;j++){
                        //console.log(specCodeAll[j].expCode);
                        //console.log(specCodeAll[j].packageSpec);
                        if(data[m].expCode!=specCodeAll[j].expCode && data[m].packageSpec!=specCodeAll[j].packageSpec){
                            specCode.expCode=data[m].expCode;
                            specCode.packageSpec=data[m].packageSpec;
                            specCodeAll.push(specCode);
                            //console.log(specCodeAll+"1");
                            //console.log(specCodeAll);
                            for(var l = 0 ;l<data.length;l++){
                                if(data[l].expCode==specCodeAll[specCodeAll.length-1].expCode && data[l].packageSpec==specCodeAll[specCodeAll.length-1].packageSpec){
                                    importPrice+=data[l].importPrice;
                                    exportPrice+=data[l].exportPrice;
                                    detailsData.push(data[l]);
                                    //console.log(detailsData);
                                    //console.log("huan");
                                }
                            }
                            var sp = {};
                            sp.ioClass= "单品总合计：";
                            sp.importPrice = importPrice;
                            sp.exportPrice =exportPrice;
                            detailsData.push(sp);
                            var importPrice = 0.00;
                            var exportPrice = 0.00;
                         }

                    }
                }
            }
            specCodeAll.splice(0,specCodeAll.length);
        },'json');
        promise.done(function(){
            $("#importDetail").datagrid('loadData',detailsData);
        })
        detailsData.splice(0,detailsData.length);



    }
})