///**
// * 消耗品出库单据查询
// * Created by wangbinbin on 2015/10/26.
// */
function checkRadio() {
    if ($("#billing:checked").val()) {
        $("#startBill").textbox("enable");
        $("#stopBill").textbox("enable");
    } else {
        $("#startBill").textbox("clear");
        $("#stopBill").textbox("clear");
        $("#startBill").textbox({disabled: true});
        $("#stopBill").textbox({disabled: true});
    }
    if ($("#dateTime:checked").val()) {
        $("#startDate").datebox("enable");
        $("#stopDate").datebox("enable");
    } else {
        $("#startDate").datebox("clear");
        $("#stopDate").datebox("clear");
        $("#startDate").datebox({disabled: true});
        $("#stopDate").datebox({disabled: true});
    }
    if ($("#expName:checked").val()) {
        $("#searchInput").combogrid("enable");
    } else {
        $("#searchInput").combogrid("clear");
        $("#searchInput").combogrid({disabled: true});
    }
    if ($("#dept:checked").val()) {
        $("#depts").combogrid("enable");
    } else {
        $("#depts").combogrid("clear");
        $("#depts").combogrid({disabled: true});
    }
    if ($("#exportClassName:checked").val()) {
        $("#exportClass").combobox("enable");
    } else {
        $("#exportClass").combobox("clear");
        $("#exportClass").combobox({disabled: true});
    }
}
function myformatter2(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '/' + (m < 10 ? ('0' + m) : m) + '/' + (d < 10 ? ('0' + d) : d);
}
function w3(s) {
    if (!s){
        return new Date();
    }
    var y = s.substring(0, 4);
    var m = s.substring(5, 7);
    var d = s.substring(8, 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d);
    } else {
        return new Date();
    }
}
$(function () {
    /**
     * 供货方
     *
     */
    var masterDataVo = {};//主表vo
    var masters = [];//信息
    var currentDocumentNo;//当前账单号
    var flag = 0;

    /**
    * 定义主表信息表格
    */
    $("#exportMaster").datagrid({
        fit: true,
        fitColumns: true,
        singleSelect: true,
        showFooter: true,
        rownumbers: true,
        title: "消耗品出库单信息",
        footer: '#ft',
        toolbar:'#expExportDetail',
        columns: [[{
            title: '库房',
            field: 'storage',
            width: '9%',
            editor: {type: 'textbox'}
        }, {
            title: '出库库日期',
            field: 'exportDate',
            width: '9%'

        }, {
            title: '出库单号',
            field: 'documentNo',
            width: '9%',
            editor: {type: 'textbox'}
        }, {
            title: '收货方',
            field: 'receiver',
            width: '9%',
            editor: {type: 'textbox'}
        }, {
            title: "应付金额",
            width: '9%',
            field: 'accountReceivable'
        }, {
            title: '已付金额',
            field: 'accountPayed',
            width: '9%',
            editor: {type: 'textbox'}
        }, {
            title: '附加费用',
            field: 'additionalFee',
            width: '9%',
            editor: {type: 'numberbox'}
        }, {
            title: '出库类别',
            width: '9%',
            field: 'exportClass'

        }, {
            title: '记账',
            width: '9%',
            field: 'accountIndicator'
        }, {
            title: '操作员',
            width: '9%',
            field: 'operator'
        }, {
            title: '作废',
            width: '9%',
            field: 'docStatus'
        }]],
        onClickRow: function (index, row) {
            var row = $("#exportMaster").datagrid('getSelected');
            currentDocumentNo = row.documentNo;
            $("#retailDialog").dialog('open');
        },
        keyHandler: $.extend({}, $.fn.combogrid.defaults.keyHandler, {
            enter: function (e) {
                var row = $("#exportMaster").datagrid('getSelected');
                if (row) {
                    currentDocumentNo = row.documentNo;
                    $("#retailDialog").dialog('open');
                }
                $(this).combogrid('hidePanel');
            }
        })
    });
    //设置时间
    var curr_time = new Date();
    $("#startDate").datebox("setValue", myformatter2(curr_time));
    $("#stopDate").datebox("setValue", myformatter2(curr_time));
    //出库分类字典
    $("#exportClass").combobox({
        url: '/api/exp-export-class-dict/list',
        valueField: 'exportClass',
        textField: 'exportClass',
        method: 'GET'
    });
    $('#searchInput').combogrid({
        disabled: true,
        panelWidth: 200,
        idField: 'expCode',
        textField: 'expName',
        url: '/api/exp-name-dict/list-exp-name-by-input',
        method: 'GET',
        mode: 'remote',
        columns: [[
            {field: 'expCode', title: '消耗品代码', width: 100},
            {field: 'expName', title: '消耗品名称', width: 100}
        ]],
        //pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false
        //pageSize: 50,
        //pageNumber: 1
    });
    //科室字典
    var depts = {};
    var promise = $.get("/api/dept-dict/list?hospitalId=" + parent.config.hospitalId, function (data) {
        depts = data;
        return depts;
    });
    promise.done(function () {
        $("#depts").combogrid({
            idField: 'deptName',
            textField: 'deptName',
            data: depts,
            panelWidth: 200,
            columns: [[{
                title: '科室名称',
                field: 'deptName'
            }, {
                title: '科室代码',
                field: 'deptCode'
            }, {
                title: '输入码',
                field: 'inputCode'
            }]],
            filter: function (q, row) {
                return $.startWith(row.inputCode.toUpperCase(), q.toUpperCase());
            }
        })
    });

    $("#searchBtn").on('click', function () {
        var promiseMaster = loadDict();
        promiseMaster.done(function () {
            $("#exportMaster").datagrid('loadData', masters);

        })
    })
    var loadDict = function () {
        masterDataVo.imClass = $("#exportClass").combobox("getText");
        masterDataVo.startBill = $("#startBill").textbox("getText");
        masterDataVo.stopBill = $("#stopBill").textbox("getText");
        masterDataVo.classRadio = $("#detailForm input[name='radioOne']:checked").val();
        masterDataVo.billRadio = $("#detailForm input[name='radioTwo']:checked").val();
        if ($("#dateTime:checked").val()) {
            masterDataVo.startDate = $("#startDate").datebox("getText");
            masterDataVo.stopDate = $("#stopDate").datebox("getText");
        } else {
            $("#startDate").datebox("clear");
            $("#stopDate").datebox("clear");
            masterDataVo.startDate = $("#startDate").datebox("getText");
            masterDataVo.stopDate = $("#stopDate").datebox("getText");
        }
        masterDataVo.receiver = $("#depts").combogrid("getText");
        masterDataVo.searchInput = $("#searchInput").combogrid("getValue");
        masterDataVo.hospitalId = parent.config.hospitalId;
        masterDataVo.storage = parent.config.storageCode;
        var promise = $.get("/api/exp-export/exp-export-document-search", masterDataVo, function (data) {
            for(var i = 0 ;i<data.length;i++){
                if(data[i].accountIndicator=='1'){
                    data[i].accountIndicator='已记账';
                }
                if(data[i].accountIndicator=='0'|| data[i].accountIndicator==null ){
                    data[i].accountIndicator='未记账';
                }
                if(data[i].docStatus=='1' ||data[i].docStatus==null){
                    data[i].docStatus='作废';
                }
                if(data[i].docStatus=='0'){
                    data[i].docStatus='未作废';
                }
            }
            masters = data;
        }, 'json');
        return promise;

    }
    $("#retailDialog").dialog({
        title: '消耗品出库明细',
        width: "80%",
        height: 300,
        closed: false,
        inline: true,
        catch: false,
        modal: true,
        closed: true,
        onBeforeOpen: function () {
            $("#exportRetailData").datagrid('load', {documentNo: currentDocumentNo, hospitalId: parent.config.hospitalId});
            $("#exportRetailData").datagrid('selectRow', 0)
        }
    });
    $("#exportRetailData").datagrid({
        singleSelect: true,
        fit: true,
        fitColumns: true,
        url: '/api/exp-export/exp-export-document-detail-search/',
        method: 'GET',
        columns: [[{
            title: '产品名称',
            field: 'expName'
        }, {
            title: '数量',
            field: 'quantity'
        }, {
            title: '规格',
            field: 'expSpec'
        }, {
            title: '批号',
            field: 'batchNo'
        }, {
            title: '单位',
            field: 'units'
        }, {
            title: '有效期',
            field: 'expireDate',
            formatter: formatterDate
        }, {
            title: '厂家',
            field: 'firmId'
        }, {
            title: '批发价',
            field: 'tradePrice'
        }, {
            title: '零售价',
            field: 'retailPrice'
        }, {
            title: '进价',
            field: 'purchasePrice'
        }, {
            title: '结存',
            field: 'inventory'
        }, {
            title: '零价合计',
            field: 'zeroAccount'
        }]],
        onLoadSuccess:function(data){
            console.log(data);
            flag = flag+1;
            if(flag==2){
                console.log(flag);
                if(data.total==0 ){
                    $.messager.alert('系统提示','库房暂无该出库单据明细','info');
                    $("#retailDialog").dialog('close');
                }
                flag=0;
            }
        }
    });
    ////格式化日期函数
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
})