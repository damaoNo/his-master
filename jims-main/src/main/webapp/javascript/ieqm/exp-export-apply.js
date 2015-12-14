$(function () {
    var deptId = '';
    var editIndex;
    var applyNo;
    var subStorageDicts = [];
    var documentNo;
    var currentExpCode;

    var stopEdit = function () {
        if (editIndex || editIndex == 0) {
            $("#right").datagrid('endEdit', editIndex);
            editIndex = undefined;
        }
    }

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

    function w3(s) {
        if (!s) return new Date();
        var y = s.substring(0, 4);
        var m = s.substring(5, 7);
        var d = s.substring(8, 10);

        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m - 1, d);
        } else {
            return new Date();
        }
    }
    //申请开始日期
    $('#startDate').datebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();

            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d);
            $('#startDate').datetimebox('setText', dateTime);
            $('#startDate').datetimebox('hidePanel');
        }
    });
    //申请结束日期
    $('#endDate').datebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();

            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d);
            $('#endDate').datetimebox('setText', dateTime);
            $('#endDate').datetimebox('hidePanel');
        }
    });
    //出库日期
    $('#exportDate').datebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();

            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d);
            $('#exportDate').datetimebox('setText', dateTime);
            $('#exportDate').datetimebox('hidePanel');
        }
    });

    //获取子库房数据
    var promise=$.get('/api/exp-sub-storage-dict/list-by-storage?storageCode=' + parent.config.storageCode + "&hospitalId=" + parent.config.hospitalId, function (data) {
        subStorageDicts=data;
    });

    promise.done(function(){
        //子库房数据加载
        $('#subStorage').combobox({
            panelHeight: 'auto',
            data:subStorageDicts,
            valueField: 'subStorage',
            textField: 'subStorage',
            onLoadSuccess: function () {
                var data = $(this).combobox('getData');
                if (data.length > 0) {
                    $(this).combobox('select', data[0].subStorage);
                }
            },
            onChange: function (newValue, oldValue) {
                createNewDocument(newValue);
            }
        });
    });
    //生成单据号
    var createNewDocument = function (subStorageCode) {
        var storage;
        $.each(subStorageDicts, function (index, item) {
            if (item.subStorage == subStorageCode) {
                storage = item;
            }
        });

        if (storage) {
            if (storage.exportNoPrefix.length <= 4) {
                documentNo = storage.exportNoPrefix + '000000'.substring((storage.exportNoAva + "").length) + storage.exportNoAva;
            } else if (storage.exportNoPrefix.length = 5) {
                documentNo = storage.exportNoPrefix + '00000'.substring((storage.exportNoAva + "").length) + storage.exportNoAva;
            } else if (storage.exportNoPrefix.length = 6) {
                documentNo = storage.exportNoPrefix + '0000'.substring((storage.exportNoAva + "").length) + storage.exportNoAva;
            }
        }
        //单据号赋值
        $("#documentNo").textbox('setValue', documentNo);
    }
    $("#documentNo").textbox({disabled: true});

    //开支类别数据加载
    $('#fundItem').combobox({
        panelHeight: 'auto',
        url: '/api/exp-fund-item-dict/list',
        method: 'GET',
        valueField: 'serialNo',
        textField: 'fundItem',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            if (data.length > 0) {
                $(this).combobox('select', data[0].serialNo);
            }
        }
    });

    //出库类别数据加载
    $('#exportClass').combobox({
        panelHeight: 'auto',
        url: '/api/exp-export-class-dict/list',
        method: 'GET',
        valueField: 'exportClass',
        textField: 'exportClass',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            if (data.length > 0) {
                $(this).combobox('select', data[0].exportClass);
            }
        }
    });

    //申请库房数据加载
    $('#storage').combogrid({
        panelWidth: 500,
        idField: 'storageCode',
        textField: 'storageName',
        loadMsg: '数据正在加载',
        url: '/api/exp-storage-dept/list?hospitalId=' + parent.config.hospitalId,
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'storageCode', title: '编码', width: 150, align: 'center'},
            {field: 'storageName', title: '名称', width: 150, align: 'center'},
            {field: 'disburseNoPrefix', title: '拼音', width: 100, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });


    //发往库房数据加载
    $('#receiver').combogrid({
        panelWidth: 500,
        idField: 'storageCode',
        textField: 'storageName',
        loadMsg: '数据正在加载',
        url: '/api/exp-storage-dept/list?hospitalId=' + parent.config.hospitalId,
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'storageCode', title: '编码', width: 150, align: 'center'},
            {field: 'storageName', title: '名称', width: 150, align: 'center'},
            {field: 'disburseNoPrefix', title: '拼音', width: 100, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });

    //负责人数据加载
    $('#principal').combogrid({
        panelWidth: 500,
        idField: 'id',
        textField: 'name',
        loadMsg: '数据正在加载',
        url: '/api/staff-dict/list-by-hospital?hospitalId=' + parent.config.hospitalId,
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'empNo', title: '员工编号', width: 150, align: 'center'},
            {field: 'name', title: '姓名', width: 150, align: 'center'},
            {field: 'loginName', title: '用户名', width: 150, align: 'center'},
            {field: 'inputCode', title: '拼音码', width: 150, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });

    //保管员数据加载
    $('#storekeeper').combogrid({
        panelWidth: 500,
        idField: 'id',
        textField: 'name',
        loadMsg: '数据正在加载',
        url: '/api/staff-dict/list-by-hospital?hospitalId=' + parent.config.hospitalId,
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'empNo', title: '员工编号', width: 150, align: 'center'},
            {field: 'name', title: '姓名', width: 150, align: 'center'},
            {field: 'loginName', title: '用户名', width: 150, align: 'center'},
            {field: 'inputCode', title: '拼音码', width: 150, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });

    //领取人数据加载
    $('#buyer').combogrid({
        panelWidth: 500,
        idField: 'id',
        textField: 'name',
        loadMsg: '数据正在加载',
        url: '/api/staff-dict/list-by-hospital?hospitalId=' + parent.config.hospitalId,
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'empNo', title: '员工编号', width: 150, align: 'center'},
            {field: 'name', title: '姓名', width: 150, align: 'center'},
            {field: 'loginName', title: '用户名', width: 150, align: 'center'},
            {field: 'inputCode', title: '拼音码', width: 150, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });

    //左侧列表初始化
    $("#left").datagrid({
        title: '出库申请单',
        singleSelect: false,
        fit: true,
        nowrap: false,
        url: '',
        method: 'GET',
        columns: [[{
            title: '申请编号',
            field: 'applicantNo',
            width: "25%"
        }, {
            title: '申请单位',
            field: 'deptName',
            width: "25%"
        }, {
            title: '单位代码',
            field: 'applicantStorage',
            width: "25%"
        }, {
            title: '申请时间',
            field: 'enterDate',
            width: "25%"
        }]],
        onSelect:function(index, row){
            var rows = $("#left").datagrid("getSelections");
            if(rows.length==1){
                deptId="";
                $('#receiver').combogrid("setValue","");
                $('#receiver').combogrid("setText", "");
            }
            if(deptId==""){
                deptId=row.deptId;
                $('#receiver').combogrid("setValue", deptId);
                $('#receiver').combogrid("setText", row.deptName);
            }else{
                if(deptId!=row.deptId){
                    $.messager.alert("提示","您本次所选的申请单的申请科室和前面所选的申请单的申请科室不一致，不允许选中本申请单！","error");
                    $("#left").datagrid("unselectRow",index);
                }
            }

        }
    });

    //右侧列表初始化
    $("#right").datagrid({
        title: '申请出库消耗品',
        singleSelect: true,
        fit: true,
        fitColumns: true,
        columns: [[{
            title: '产品代码',
            field: 'expCode',
            width: "10%",
            editor: {
                type: 'textbox',
                options: {}
            }
        }, {
            title: '产品类型',
            field: 'expForm',
            width: "7%",
            editor: {
                type: 'textbox',
                options: {}
            }
        }, {
            title: '品名',
            field: 'expName',
            width: "9%",
            editor: {
                type: 'combogrid', options: {
                    mode: 'remote',
                    url: '/api/exp-name-dict/list-exp-name-by-input',
                    singleSelect: true,
                    method: 'GET',
                    panelWidth: 200,
                    idField: 'expName',
                    textField: 'expName',
                    columns: [[{
                        title: '代码',
                        field: 'expCode',
                        width: "30%"
                    }, {
                        title: '品名',
                        field: 'expName',
                        width: "40%",
                        editor: {type: 'text', options: {required: true}}
                    }, {
                        title: '拼音码',
                        field: 'inputCode',
                        width: "30%",
                        editor: 'text'
                    }]],
                    onClickRow: function (index, row) {
                        //var ed = $("#right").datagrid('getEditor', {index: editIndex, field: 'expCode'});
                        //$(ed.target).textbox('setValue', row.expCode);
                        currentExpCode = row.expCode;
                        $("#expDetailDialog").dialog('open');
                    },
                    keyHandler: $.extend({}, $.fn.combogrid.defaults.keyHandler, {
                        enter: function (e) {
                            var row = $(this).combogrid('grid').datagrid('getSelected');
                            if (row) {
                                //var ed = $("#right").datagrid('getEditor', {index: editIndex, field: 'expCode'});
                                //$(ed.target).textbox('setValue', row.expCode);
                                currentExpCode = row.expCode;
                                $("#expDetailDialog").dialog('open');
                            }
                            $(this).combogrid('hidePanel');
                        }
                    })
                }
            }
        }, {
            title: '规格',
            field: 'expSpec',
            width: "7%",
            editor: {
                type: 'textbox',
                options: {}
            }
        }, {
            title: '包装单位',
            field: 'packageUnits',
            width: "7%",
            editor: {
                type: 'textbox',
                options: {}
            }
        }, {
            title: '数量',
            field: 'quantity',
            width: "7%",
            editor: {
                type: 'numberbox',
                options: {
                    max: 99999.99,
                    size: 8,
                    maxlength: 8,
                    precision: 2
                }
            }
        }, {
            title: '单价',
            field: 'purchasePrice',
            width: "7%",
            editor: {
                type: 'numberbox',
                options: {}
            }
        }, {
            title: '金额',
            field: 'planNumber',
            width: "7%",
            editor: {
                type: 'numberbox',
                options: {
                precision: '2'
                }
            }
        }, {
            title: '厂家',
            field: 'firmId',
            width: "7%",
            editor: {
                type: 'textbox',
                options: {
                    editable: false
                }
            }
        }, {
            title: '分摊方式',
            field: 'assignName',
            width: "7%",
            editor: {
                type: 'combobox',
                options: {
                    panelHeight: 'auto',
                    url: '/api/exp-assign-dict/list',
                    valueField: 'assignName',
                    textField: 'assignName',
                    method: 'GET',
                    onLoadSuccess: function () {
                        var data = $(this).combobox('getData');
                        $(this).combobox('select', data[0].assignName);
                    }
                }
            }
        }, {
            title: '备注',
            field: 'memos',
            width: "7%",
            editor: {type: 'text'}
        }, {
            title: '批号',
            field: 'batchNo',
            width: "7%"
        }, {
            title: '有效期',
            field: 'expireDate',
            formatter: formatterDate,
            width: "7%"
        }, {
            title: '生产日期',
            field: 'producedate',
            formatter: formatterDate,
            width: "7%"
        }, {
            title: '消毒日期',
            field: 'disinfectdate',
            formatter: formatterDate,
            width: "7%"
        }, {
            title: '灭菌标识',
            field: 'killflag',
            width: '7%',
            formatter: function (value, row, index) {
                if (value == '1') {
                    return '<input type="checkbox" name="DataGridCheckbox" checked="true" />';
                }
                if (value == '0') {
                    return '<input type="checkbox" name="DataGridCheckbox" />';
                }
                if (value == undefined) {
                    return value = '<input type="checkbox" name="DataGridCheckbox" />';
                }
            }
        }, {
            title: '单位',
            field: 'units',
            width: "7%"
        }, {
            title: '结存量',
            field: 'disNum',
            width: "7%"
        }]],
        onDblClickRow: function (index, row) {
            if (index != editIndex) {
                $(this).datagrid('endEdit', editIndex);
                editIndex = index;
            }
            $(this).datagrid('beginEdit', editIndex);

            currentExpCode = row.expCode;
            $("#expDetailDialog").dialog('open');
        }
    });

    $("#top").datagrid({
        toolbar: '#ft',
        border: true
    });
    $("#bottom").datagrid({
        footer: '#tb',
        border: false
    });

    $('#dg').layout('panel', 'north').panel('resize', {height: 'auto'});
    $('#dg').layout('panel', 'south').panel('resize', {height: 'auto'});

    $("#dg").layout({
        fit: true
    });

    $("#applyDialog").dialog({
        title: '选择申请出库的消耗品',
        width: 700,
        height: 300,
        closed: false,
        catch: false,
        modal: true,
        closed: true,
        footer: '#footer',
        onOpen: function () {
            $("#applyDatagrid").datagrid('load', {
                storageCode: parent.config.storageCode,
                applyStorage: deptId,
                applyNo:applyNo,
                hospitalId: parent.config.hospitalId
            });
            $("#applyDatagrid").datagrid('selectRow', 0);
        }
    });

    $("#applyDatagrid").datagrid({
        singleSelect: false,
        fit: true,
        fitColumns: true,
        url: '/api/exp-provide-application/find-dict-application/',
        method: 'GET',
        columns: [[{
            title: '申请单号',
            field: 'applicantNo',
            width: "10%"
        }, {
            title: '序号',
            field: 'itemNo',
            width: "7%"
        }, {
            title: '消耗品',
            field: 'expName',
            width: "10%"
        }, {
            title: '规格',
            field: 'expSpec',
            width: "10%"
        }, {
            title: '数量',
            field: 'quantity',
            width: "7%"
        }, {
            title: '单位',
            field: 'packageUnits',
            width: "7%"
        }, {
            title: '申请时间',
            field: 'enterDateTime',
            formatter: formatterDate,
            width: "10%"
        }, {
            title: '产品类型',
            field: 'expForm',
            width: "10%"
        }, {
            title: '审核人',
            field: 'auditingOperator',
            width: "10%",
            editor: {
                type: 'combogrid',
                options: {
                    panelWidth: 500,
                    idField: 'id',
                    textField: 'name',
                    loadMsg: '数据正在加载',
                    url: '/api/staff-dict/list-by-hospital?hospitalId=' + parent.config.hospitalId,
                    mode: 'remote',
                    method: 'GET',
                    columns: [[
                        {field: 'empNo', title: '员工编号', width: 150, align: 'center'},
                        {field: 'name', title: '姓名', width: 150, align: 'center'},
                        {field: 'loginName', title: '用户名', width: 150, align: 'center'},
                        {field: 'inputCode', title: '拼音码', width: 150, align: 'center'}
                    ]],
                    pagination: false,
                    fitColumns: true,
                    rowNumber: true,
                    autoRowHeight: false,
                    pageSize: 50,
                    pageNumber: 1
                }
            }
        }, {
            title: '审核数量',
            field: 'auditingQuantity',
            width: "10%",
            editor: {
                type: 'numberbox',
                options: {
                    max: 99999.99,
                    size: 8,
                    maxlength: 8,
                    precision: 2
                }
            }
        }]],
        onClickCell: function (index, field, row) {
            if (index != editIndex) {
                $(this).datagrid('endEdit', editIndex);
                editIndex = index;
            }
            $(this).datagrid('beginEdit', editIndex);
        }
    });

    //全选功能
    $("#selectAll").on('click', function () {
        $("#applyDatagrid").datagrid('selectAll');
    });
    //不选功能
    $("#selectNon").on('click', function () {
        $("#applyDatagrid").datagrid('unselectAll');
    });
    //作废功能
    $("#abandon").on('click', function () {
        $("#applyDatagrid").datagrid('endEdit', editIndex);
        $("#applyDatagrid").datagrid("acceptChanges");
        var rows = $("#applyDatagrid").datagrid("getSelections");
        if(rows.length<=0){
            $.messager.alert("系统提示", "请选择要作废的数据", "info");
        }else{
            $.messager.confirm("提示信息","真的要作废这些项目吗？",function(r){
                if(r){
                    $.postJSON("/api/exp-provide-application/abandon", rows, function (data) {
                        $.messager.alert("系统提示", "作废成功", "info");
                        //刷新左侧列表
                        $("#applyDialog").dialog('close');
                        $("#search").click();
                    }, function (data) {
                        $.messager.alert('提示', data.responseJSON.errorMessage, "error");
                    });
                }

            })
        }
    });
    //确定功能
    $("#confirm").on('click', function () {
        var rows = $("#applyDatagrid").datagrid("getSelections");
        if (rows.length <= 0) {
            $.messager.alert("系统提示", "请选择要作废的数据", "info");
        } else {
            $("#right").datagrid("loadData", rows);

            $("#applyDialog").dialog('close');
            //$("#expDetailDialog").dialog('open');
            //$("#expDetailDatagrid").datagrid('selectRow', 0);
        }
    });
    //取消功能
    $("#cancel").on('click', function () {
        $("#applyDialog").dialog('close');
    });

    //选择规格
    $("#expDetailDialog").dialog({
        title: '选择规格',
        width: 700,
        height: 300,
        closed: false,
        catch: false,
        modal: true,
        closed: true,
        onOpen: function () {
            $("#expDetailDatagrid").datagrid('load', {
                storageCode: parent.config.storageCode,
                expCode: currentExpCode,
                hospitalId: parent.config.hospitalId
            });
            $("#expDetailDatagrid").datagrid('selectRow', 0);
        }
    });

    $("#expDetailDatagrid").datagrid({
        singleSelect: true,
        fit: true,
        fitColumns: true,
        url: '/api/exp-stock/stock-export-record/',
        method: 'GET',
        columns: [[{
            title: '代码',
            field: 'expCode'
        }, {
            title: '名称',
            field: 'expName'
        }, {
            title: '数量',
            field: 'quantity'
        }, {
            title: '规格',
            field: 'expSpec'
        }, {
            title: '最小规格',
            field: 'minSpec'
        }, {
            title: '单位',
            field: 'units'
        }, {
            title: '最小单位',
            field: 'minUnits'
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
            title: '注册证号',
            field: 'registerNo'
        }, {
            title: '许可证号',
            field: 'permitNo'
        }]],
        onDblClickRow: function (index, row) {
            $("#right").datagrid('endEdit', editIndex);
            var rowDetail = $("#right").datagrid('getData').rows[editIndex];
            rowDetail.expName = row.expName;
            rowDetail.expForm = row.expForm;
            rowDetail.expSpec = row.expSpec;
            rowDetail.expCode = row.expCode;
            rowDetail.units = row.units;
            rowDetail.packageUnits = row.units;
            rowDetail.disNum = row.quantity;
            rowDetail.purchasePrice = row.purchasePrice;
            rowDetail.memos = row.memos;
            rowDetail.firmId = row.firmId;
            rowDetail.batchNo = row.batchNo;
            rowDetail.expireDate = row.expireDate;
            rowDetail.producedate = row.producedate;
            rowDetail.disinfectdate = row.disinfectdate;
            rowDetail.killflag = row.killflag;

            $("#right").datagrid('refreshRow', editIndex);
            $("#expDetailDialog").dialog('close');
            $("#right").datagrid('beginEdit', editIndex);


        }

    });


    //查询功能
    $("#search").on('click', function () {
        var startDate = $("#startDate").datetimebox('getText');
        var endDate = $("#endDate").datetimebox('getText');
        var applyStorage = $("#storage").combobox("getValue");
        var storageCode = parent.config.storageCode;
        var hospitalId = parent.config.hospitalId;
        $.get('/api/exp-export/export-apply?storageCode=' + storageCode + "&applyStorage=" + applyStorage +"&hospitalId="+ hospitalId+ "&startDate=" + startDate + "&endDate=" + endDate, function (data) {
            if (data.length <= 0) {
                $.messager.alert("系统提示", "没有记录", "info");
            } else {
                $("#left").datagrid("loadData", data);
            }
        });
    });

    //追加功能
    $("#addRow").on('click', function () {
        $('#right').datagrid('appendRow', {});
    });

    //删除按钮功能
    $("#delete").on('click', function () {
        var row = $('#right').datagrid('getSelected');
        var index = $('#right').datagrid('getRowIndex', row);
        if (index == -1) {
            $.messager.alert("提示", "请选择删除的行", "info");
        } else {
            $('#right').datagrid('deleteRow', index);
            editIndex = undefined;
        }
    });

    //申请数据按钮功能
    $("#apply").on('click', function () {
        var rows = $("#left").datagrid("getSelections");
        var nos = "";
        if(rows.length<=0){
            $.messager.alert("提示", "请选择出库申请单", "info");
        }else{
            $.each(rows, function (index, item) {
                nos+="'"+item.applicantNo+"',";
            })
            nos = nos.substr(0,nos.length-1);
            applyNo = nos;
            $("#applyDialog").dialog('open');
        }

    });

    /**
     * 进行数据校验
     */
    var dataValid = function () {
        var rows = $("#right").datagrid('getRows');
        if (rows.length == 0) {
            $.messager.alert("系统提示", "明细记录为空，不允许保存", 'error');
            return false;
        }
        //判断供货商是否为空
        var receiver = $("#receiver").combogrid('getValue');
        if (!receiver) {
            $.messager.alert("系统提示", "产品出库，发往不能为空", 'error');
            return false;
        }
        var exportDate = $("#exportDate").datebox('calendar').calendar('options').current;
        if (!exportDate) {
            $.messager.alert("系统提示", "产品出库，出库时间不能为空", 'error');
            return false;
        }
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].quantity == 0) {
                $.messager.alert("系统提示", "第" + i + "行入库数量为0 请重新填写", 'error');
                return false;
            }
        }

        return true;
    }
    //封装出库数据
    var getCommitData = function () {
        var expExportMasterBeanChangeVo = {};
        expExportMasterBeanChangeVo.inserted = [];
        var exportMaster = {};
        exportMaster.documentNo = $("#documentNo").textbox('getValue');
        exportMaster.storage = parent.config.storageCode;
        exportMaster.exportDate = $("#exportDate").datebox('calendar').calendar('options').current;
        exportMaster.receiver = $("#receiver").combogrid('getValue');
        exportMaster.accountReceivable = $("#accountReceivable").numberbox('getValue');
        exportMaster.accountPayed = $("#accountPayed").numberbox('getValue');
        exportMaster.additionalFee = $("#additionalFee").numberbox('getValue');
        exportMaster.exportClass = $("#exportClass").combobox('getValue');
        exportMaster.subStorage = $("#subStorage").combobox('getValue');
        exportMaster.accountIndicator = 1;
        exportMaster.memos = $('#memos').textbox('getValue');
        exportMaster.fundItem = $('#fundItem').combogrid('getValue');
        exportMaster.operator = parent.config.loginName;
        exportMaster.acctoperator = parent.config.loginName;
        //exportMaster.acctdate = "";
        exportMaster.principal = $("#principal").combogrid('getValue');
        exportMaster.storekeeper = $("#storekeeper").combogrid('getValue');
        exportMaster.buyer = $("#buyer").combogrid('getValue');
        exportMaster.docStatus = 0;
        exportMaster.hospitalId = parent.config.hospitalId;

        expExportMasterBeanChangeVo.inserted.push(exportMaster);

        //明细记录
        var expExportDetailBeanChangeVo = {};
        expExportDetailBeanChangeVo.inserted = [];

        var rows = $("#right").datagrid('getRows');

        for (var i = 0; i < rows.length; i++) {
            var rowIndex = $("#right").datagrid('getRowIndex', rows[i]);

            var detail = {};
            detail.documentNo = exportMaster.documentNo;
            detail.itemNo = i;
            detail.expCode = rows[i].expCode;
            detail.expSpec = rows[i].expSpec;
            detail.units = rows[i].units;
            detail.batchNo = rows[i].batchNo;
            detail.expireDate = new Date(rows[i].expireDate);
            detail.firmId = rows[i].firmId;
            detail.expForm = rows[i].expForm;
            detail.importDocumentNo = rows[i].importDocumentNo;
            detail.purchasePrice = rows[i].purchasePrice;
            detail.tradePrice = rows[i].retailPrice;
            detail.retailPrice = rows[i].retailPrice;
            detail.packageSpec = rows[i].packageSpec;
            detail.quantity = rows[i].quantity;
            detail.packageUnits = rows[i].packageUnits;
            detail.subPackage1 = rows[i].subPackage1;
            detail.subPackageUnits1 = rows[i].subPackageUnits1;
            detail.subPackageSpec1 = rows[i].subPackageSpec1;
            detail.subPackage2 = rows[i].subPackage2;
            detail.subPackageUnits2 = rows[i].subPackageUnits2;
            detail.subPackageSpec2 = rows[i].subPackageSpec2;
            detail.inventory = rows[i].disNum;
            detail.producedate = new Date(rows[i].producedate);
            detail.disinfectdate = new Date(rows[i].disinfectdate);
            detail.killflag = rows[i].killflag;
            //detail.recFlag="";
            //detail.recOperator="";
            //detail.recDate="";
            detail.assignCode = rows[i].assignCode;
            detail.bigCode = rows[i].expCode;
            detail.bigSpec = rows[i].expSpec;
            detail.bigFirmId = rows[i].firmId;
            detail.expSgtp = rows[i].expSgtp;
            detail.memo = rows[i].memo;
            detail.hospitalId = parent.config.hospitalId;
            expExportDetailBeanChangeVo.inserted.push(detail);
        }

        var exportVo = {};
        exportVo.expExportMasterBeanChangeVo = expExportMasterBeanChangeVo;
        exportVo.expExportDetailBeanChangeVo = expExportDetailBeanChangeVo;
        return exportVo;
    }

    //保存按钮操作
    $("#save").on('click', function () {
        if (editIndex || editIndex == 0) {
            $("#right").datagrid('endEdit', editIndex);
        }
        if(dataValid()){
            $.messager.confirm("提示信息", "真的要保存这些项目吗？", function (r) {
                if (r) {
                    var exportVo = getCommitData();
                    $.postJSON("/api/exp-stock/exp-export-manage", exportVo, function (data) {
                        $.messager.alert("系统提示", "出库数据保存成功", "info");
                        //刷新左侧列表
                        $("#search").click();
                        $("#clear").click();
                    }, function (data) {
                        $.messager.alert('提示', data.responseJSON.errorMessage, "error");
                    });
                }

            })
        }
    });
    //打印按钮操作
    $("#print").on('click', function () {
        alert("print");
    });

    //清屏按钮操作
    $("#clear").on('click', function () {
        $("#right").datagrid('loadData', {total: 0, rows: []});
    });
});