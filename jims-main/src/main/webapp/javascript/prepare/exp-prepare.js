/**
 * Created by wei on 2016/6/2.
 */
$(function () {
    var expCode = '';
    var editIndex;
    var newBuyId = '';
    var maxBuyNo = 1;
    var currentExpCode = "";
    var flag;
    var supplierId="";
    var stopEdit = function () {
        if (editIndex || editIndex == 0) {
            $("#left").datagrid('endEdit', editIndex);
        }
    };
    /**
     * 子库房
     */
    var subStorages = [];
    var promise = $.get("/api/exp-sub-storage-dict/list-by-storage?storageCode="+parent.config.storageCode+"&hospitalId="+parent.config.hospitalId, function (data) {
        subStorages = data;
    });
    promise.done(function () {
        $("#subStorage").combogrid({
            idField: 'id',
            textField: 'subStorage',
            data: subStorages,
            panelWidth: 450,
            fitColumns: true,
            columns: [
                [
                    {
                        title: '子库房名称',
                        field: 'subStorage', width: 180, align: 'center'
                    },
                    {
                        title: '子库房代码',
                        field: 'storageCode', width: 130, align: 'center'
                    }
                ]
            ]
        })
    });
    /**
     *供货商
     */
    var suppliers = [];
    var promise = $.get("/api/exp-supplier-catalog/list-all", function (data) {
        suppliers = data;
    });
    promise.done(function () {
        $("#supplier").combogrid({
            idField: 'id',
            textField: 'supplierName',
            //data: suppliers,
            panelWidth: 450,
            fitColumns: true,
            method: 'GET',
            mode: 'remote',
            url: '/api/exp-supplier-catalog/list-by-q',
            columns: [
                [
                    {
                        title: '供应商名称',
                        field: 'supplierName', width: 180, align: 'center'
                    },
                    {
                        title: '供应商代码',
                        field: 'supplierCode', width: 130, align: 'center'
                    },
                    {
                        title: '输入码',
                        field: 'inputCode', width: 50, align: 'center'
                    }
                ]
            ],
            onSelect:function(){
                supplierId=$("#supplier").combogrid("getValue");
            }
        })
    });


    //右侧列表初始化
    $("#right").datagrid({

        title: '备货完成明细记录',
        singleSelect: true,
        fit: true,
        fitColumns: true,
        columns: [
            [

                {
                    title: 'id',
                    field: 'id',
                    hidden: true
                },
                {
                    title: '条形码',
                    field: 'expBarCode',
                    width: "20%"
                },
                {
                    title: '备货记录ID',
                    field: 'masterId',
                    width: "10%",
                    hidden: true
                },
                {
                    title: '是否使用',
                    field: 'useFlag',
                    width: "15%",
                    formatter: function (value, row, index) {
                        if (value == '1') {
                            return '已使用';
                        }
                        if (value == '0') {
                            return '未使用';
                        }
                    }
                },
                {
                    title: '使用日期',
                    field: 'useDate',
                    width: "20%"
                },
                {
                    title: '使用病人',
                    field: 'usePatientId',
                    width: "20%"
                },
                {
                    title: '使用科室',
                    field: 'useDept',
                    width: "15%"
                },
                {
                    title: '备货人员',
                    field: 'operator',
                    width: "20%"
                }
            ]
        ]
    });

    $("#top").datagrid({
        toolbar: '#ft',
        border: false
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
    $("#delete").on('click', function () {
        var row = $('#left').datagrid('getSelected');
        var index = $('#left').datagrid('getRowIndex', row);
        if (index == -1) {
            $.messager.alert("提示", "请选择删除的行", "info");
        } else {
            $('#left').datagrid('deleteRow', index);
            editIndex = undefined;
        }
    });
    /**
     * 备货
     */
    $("#addBtn").on('click', function () {
        var supplierId = $("#supplier").combogrid("getValue");
        if (supplierId == null || "" == supplierId) {
//            $.messager.alert("提示", "请选择供货厂商！！", "info");
            $.messager.alert("系统提示", "请选择供货厂商！", 'error');
        } else {
            flag = 0;
            $("#left").datagrid('appendRow', {sign:1});
            var rows = $("#left").datagrid('getRows');
            var appendRowIndex = $("#left").datagrid('getRowIndex', rows[rows.length - 1]);
            if (editIndex || editIndex == 0) {
                $("#left").datagrid('endEdit', editIndex);
            }
            editIndex = appendRowIndex;
            $("#left").datagrid('beginEdit', editIndex);
        }
    });

    /**
     * 删除
     */
    $("#delBtn").on('click', function () {
        var row = $("#left").datagrid('getSelected');
        if(row){
            var delIndex = $("#left").datagrid('getRowIndex', row);
            if(row.sign=="1"){
                $("#left").datagrid('deleteRow', delIndex);
                if (editIndex == delIndex) {
                    editIndex = undefined;
                }
            }else{
                $.messager.alert("提示","已备货，不允许删除","info");
            }
        }else{
            $.messager.alert("提示","请选择要删除的行!","info")
        }
    });


    //保存按钮操作
    $("#save").on('click', function () {
        stopEdit();
        var rows = $("#left").datagrid('getRows');
        var subStorageValue=$("#subStorage").combogrid("getValue");
        if (rows.length == 0) {
            $.messager.alert("系统提示", "备货列表为空，不允许保存", 'error');
            return false;
        } else if(subStorageValue==""){
            $.messager.alert("系统提示", "请选择子库房", 'error');
        }else {
            if(dataValid()){
                var expPrepareVOs=[];
                var expCodes = "";
                var amounts = "";
                var prices = "";
                var packageSpecs = "";
                var phones="";
                for (var i = 0; i < rows.length; i++) {
                    var phone=rows[i].phone;
                    if(phone.length>12){
                        $.messager.alert("系统提示", "手机号码不合法!", 'error');
                        return ;
                    }
                    /**
                     *
                     private String expCodes;
                     private String amounts;
                     private String packageSpecs;
                     private String prices;
                     private String operators;
                     private String phones;
                     private String supplierId;
                     private String operator;
                     private String subStorage;
                     * @type {{}}
                     */
                    var expPare = {} ;
                    expPare.expCodes = rows[i].expCode;
                    expPare.amounts = rows[i].amount;
                    expPare.prices = rows[i].purchasePrice;
                    expPare.packageSpecs = rows[i].packageSpec;
                    expPare.phones=rows[i].phone;
                    expPare.operators=rows[i].preparePersonName;
                    expPare.supplierId=$("#supplier").combogrid("getValue");
                    expPare.operator=parent.config.staffName;
                    expPare.subStorage=$("#subStorage").combobox("getValue");
                    expPrepareVOs.push(expPare);
                }
                var supplierId = $("#supplier").combogrid("getValue");
                 $.postJSON("/api/exp-prepare/make-data",expPrepareVOs, function (data) {
                 $("#right").datagrid("loadData", data);
                }, function (data) {//List<ExpPrepareDetail>
//                console.info(data);
                    $("#right").datagrid("loadData", data);
//                $.messager.alert("系统提示", "error", 'error');
                })
            }else{
                $("#left").datagrid('beginEdit', editIndex);
            }
        }
    });
    /**
     * 进行数据校验
     */
    function dataValid() {
        var supplierId = $("#supplier").combogrid("getValue");
        var rows = $("#left").datagrid('getRows');
        for (var i = 0; i < rows.length; i++) {
//            alert(rows[i].amount );
            if (rows[i].amount == 0 ||  supplierId==null || supplierId=="") {
                $.messager.alert("系统提示", "第" + i + "行备货数量为0 请重新填写", 'error');
                $("#left").datagrid('beginEdit', i);
                return false;
            }
        }
        return true;
    }

    //打印按钮操作
    $("#printDiv").dialog({
        title: '打印预览',
        width: 1000,
        height: 520,
        catch: false,
        modal: true,
        closed: true,
        onOpen: function () {
            $("#report").prop("src", parent.config.defaultReportPath + "buy-exp-plan.cpt");
        }
    });
    $("#print").on('click', function () {
        var printData = $("#right").datagrid('getRows');
        if (printData.length <= 0) {
            $.messager.alert('系统提示', '请先查询数据', 'info');
            return;
        }
        $("#printDiv").dialog('open');

    })


    $("#stockRecordDialog").dialog({
        title: '选择规格',
        width: 700,
        height: 300,
        closed: false,
        catch: false,
        modal: true,
        closed: true,
        onOpen: function () {
            $("#stockRecordDatagrid").datagrid('load', {
//                storageCode: parent.config.storageCode,
                expCode: currentExpCode,
                hospitalId: parent.config.hospitalId
            });
            $("#stockRecordDatagrid").datagrid('selectRow', 0)
        }
    });

    $("#stockRecordDatagrid").datagrid({
        singleSelect: true,
        fit: true,
        fitColumns: true,
        url: '/api/exp-prepare/exp-spec',
        method: 'GET',
        columns: [
            [
                {
                    title: '代码',
                    field: 'expCode',
                    align: 'center',
                    width: '16%'
                },
                {
                    title: '名称',
                    field: 'expName',
                    align: 'center',
                    width: '17%'
                },
                {
                    title: '包装规格',
                    field: 'expSpec',
                    align: 'center',
                    width: '10%'
                },
                {
                    title: '最小规格',
                    field: 'minSpec',
                    align: 'center',
                    width: '10%'
                },
                {
                    title: '包装单位',
                    field: 'units',
                    align: 'center',
                    width: '10%'
                },
                {
                    title: '最小单位',
                    field: 'minUnits',
                    align: 'center',
                    width: '10%'
                },
                {
                    title: '厂家',
                    field: 'firmId',
                    align: 'center',
                    width: '17%'
                },
                {
                    title: '价格',
                    field: 'purchasePrice',
                    align: 'center',
                    width: '10%'
                }
            ]
        ],
//        purchasePrice
        onLoadSuccess: function (data) {
            flag = flag + 1;
            if (flag == 1) {
                if (data.total == 0 && editIndex != undefined) {
                    $.messager.alert('系统提示', '无法获取产品的价格信息！', 'info');
                    $("#stockRecordDialog").dialog('close');
                }
                flag = 0;
            }
        },
        onClickRow: function (index, row) {

            var rowDetail = $("#left").datagrid('getData').rows[editIndex];
            rowDetail.expCode = row.expCode;
            rowDetail.expName = row.expName;
            rowDetail.packageSpec = row.expSpec;
            rowDetail.packageUnits = row.units;
            rowDetail.units = row.minUnits;
            rowDetail.purchasePrice = row.purchasePrice;
            $("#left").datagrid('endEdit', editIndex);
            $("#left").datagrid('beginEdit', editIndex);
            $("#stockRecordDialog").dialog('close');
        }
    });

//    var supplierId = $("#supplier").combogrid("getValue");
//    alert(supplierId+"supplierId");
    //左侧列表初始化
    $("#left").datagrid({
        title: '备货列表',
        singleSelect: false,
        fit: true,
        nowrap: false,
        method: 'GET',
        columns: [
            [
                {
                    title: '品名',
                    field: 'expName',
                    align: 'center',
                    width: '20%',
                    editor: {
                        type: 'combogrid', options: {
                            mode: 'remote',
                            url: '/api/exp-prepare/find-by-firm-name',
                            singleSelect: true,
                            method: 'GET',
                            panelWidth: 300,
                            idField: 'expName',
                            textField: 'expName',
                            columns: [
                                [
                                    {
                                        title: '代码',
                                        field: 'expCode',
                                        align: 'center',
                                        width: 110
                                    },
                                    {
                                        title: '品名',
                                        field: 'expName',
                                        align: 'center',
                                        width: 120
                                    },
                                    {
                                        title: '拼音码',
                                        field: 'inputCode',
                                        align: 'center',
                                        width: 50
                                    }
                                ]
                            ],
                            onClickRow: function (index, row) {
                                var rowDetail = $("#left").datagrid('getData').rows[editIndex];
                                rowDetail.expCode = row.expCode;
//                                var ed = $("#left").datagrid('getEditor', {index: editIndex, field: 'expCode'});
//                                $(ed.target).textbox('setValue', row.expCode);
                                currentExpCode = row.expCode;
//                                alert(currentExpCode);
                                $("#stockRecordDialog").dialog('open');
                            },
                            keyHandler: $.extend({}, $.fn.combogrid.defaults.keyHandler, {
                                enter: function (e) {
                                    var row = $(this).combogrid('grid').datagrid('getSelected');
                                    if (row) {
//                                        var ed = $("#left").datagrid('getEditor', {index: editIndex, field: 'expCode'});
//                                        $(ed.target).textbox('setValue', row.expCode);    var rowDetail = $("#left").datagrid('getData').rows[editIndex];
                                        var rowDetail = $("#left").datagrid('getData').rows[editIndex];
                                        rowDetail.expCode = row.expCode;
                                        currentExpCode = row.expCode;
                                        $("#stockRecordDialog").dialog('open');
                                    }
                                    $(this).combogrid('hidePanel');
                                }
                            })
                        }
                    }
                },
                {
                    title: '包装规格',
                    field: 'packageSpec',
                    width: "15%"
                },
                {
                    title: '价格',
                    field: 'purchasePrice',
                    width: "10%"
                },
                {
                    title: '备货数量',
                    field: 'amount',
                    width: "15%",
                    editor: {type: 'textbox', options: {}}
                },
                {
                    title: 'expCode',
                    field: 'expCode',
                    hidden: true
                },
                {
                    title: '备货人',
                    field: 'preparePersonName',
                    width: "15%",
                    editor: {type: 'textbox', options: {}}
                },
                {
                    title: '备货人电话',
                    field: 'phone',
                    width: "25%",
                    editor: {type: 'textbox', options: {}}
                },
                {
                    title: 'packageUnits',
                    field: 'packageUnits',
                    hidden: true
                },
                {
                    title: 'units',
                    field: 'units',
                    hidden: true
                },
                {
                    title: 'expSpec',
                    field: 'expSpec',
                    hidden: true
                },
                {
                    title: 'sign',
                    field: 'sign',
                    hidden: true
                }
            ]
        ],
        onClickRow: function (index, row) {
            stopEdit();
            if(row.sign=="1"){
                $(this).datagrid('beginEdit', index);
            }
            editIndex = index;
        }
    });
    $("#queryBtn").on("click",function(){
        location.href="/views/his/prepare/exp-prepare-detail.html";
    })

});
