/**
 * Created by heren on 2015/10/23.
 */
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
$(function(){
    $.extend($.fn.datagrid.methods, {
            getChecked: function (jq) {
        var rr = [];
        var rows = jq.datagrid('getRows');
        jq.datagrid('getPanel').find('div.datagrid-cell input:checked').each(function () {
            var index = $(this).parents('tr:first').attr('datagrid-row-index');
            rr.push(rows[index]);
        });
        return rr;
    }
});
    var documentNo;//入库单号
    var flag ;
    var editIndex;
    var currentExpCode;
    var panelHeight = $(window).height - 300 ;

    /**
     * 设置明细信息
     */
    $("#exportDetail").datagrid({
        fit:true,
        fitColumns:true,
        footer: '#ft',
        toolbar:'#expExportMaster',
        title:'消耗品出库单',
        columns:[[{
            title:"产品代码",
            field:'expCode',
            width:"7%"
        },{
            title:'产品名称',
            field:'expName',
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
                        $('#exportDetail').datagrid('updateRow',{
                            index: editIndex,
                            row: {
                                expCode: row.expCode,
                                expName: row.expName
                            }
                        });
                        currentExpCode = row.expCode;
                        $("#stockRecordDialog").dialog('open');
                    },
                    keyHandler: $.extend({}, $.fn.combogrid.defaults.keyHandler, {
                        enter: function (e) {
                            var row = $(this).combogrid('grid').datagrid('getSelected');
                            $(this).combogrid('hidePanel');
                            if (row) {
                                $('#exportDetail').datagrid('updateRow',{
                                    index: editIndex,
                                    row: {
                                        expCode: row.expCode,
                                        expName: row.expName
                                    }
                                });
                                currentExpCode = row.expCode;
                                $("#stockRecordDialog").dialog('open');
                            }

                        }
                    })
                }
            },
            width:"7%"
        },{
            title:'包装规格',
            field:'packageSpec'
        },{
            title:'包装单位',
            field:'packageUnits'
        },{
            title:'产品类型',
            field:'expForm'
        },{
            title:'数量',
            field:'quantity',
            value: 0 ,
            editor: {
                type: 'numberbox', options: {
                    onChange: function (newValue, oldValue) {
                        var row = $("#exportDetail").datagrid('getData').rows[editIndex];
                        var amountEd = $("#exportDetail").datagrid('getEditor', {index: editIndex, field: 'amount'});
                        $(amountEd.target).numberbox('setValue', newValue * row.purchasePrice);
                        var rows = $("#exportDetail").datagrid('getRows');
                        var totalAmount = 0;
                        for (var i = 0; i < rows.length; i++) {
                            var rowIndex = $("#exportDetail").datagrid('getRowIndex', rows[i]);
                            if (rowIndex == editIndex) {
                                continue;
                            }
                            totalAmount += Number(rows[i].amount);
                        }
                        if (totalAmount) {
                            totalAmount += newValue * row.purchasePrice;
                        } else {
                            totalAmount = newValue * row.purchasePrice;
                        }
                        $("#accountReceivable").numberbox('setValue', totalAmount);
                    }
                }
            }
        },{
            title:'单价',
            field:'purchasePrice',
            width:"5%",
            precision: '2'
        },{
            title:'金额',
            field:'amount',
            editor: {
                type: 'numberbox', options: {
                    precision: '2',
                    editable: false,
                    disabled: true
                }
            },
            width:"5%"
        },{
            title:'厂家',
            field:'firmId',
            width:"7%"
        },{
            title:'分摊方式',
            field:'assignName',
            editor: {type: 'combobox', options: {
                url: '/api/exp-assign-dict/list',
                valueField: 'assignName',
                textField: 'assignName',
                method: 'GET',
                onLoadSuccess: function () {
                    var data = $(this).combobox('getData');
                    //$(this).combobox('select', data[0].assignName);
                    }
            },
            width:"8%"}
        },{
            title:'备注',
            field:'memo',
            editor: {type: 'textbox', options: {}},
            width:"8%"
        },{
            title:'批号',
            field:'batchNo'
        },{
            title:'有效期',
            field:'expireDate',
            formatter:formatterDate,
            width:"7%"
        },{
            title:'生产日期',
            field:'producedate',
            formatter:formatterDate,
            width:"7%"
        },{
            title:'消毒日期',
            field:'disinfectdate',
            formatter:formatterDate,
            width:"7%"
        },{
            title:'单位',
            field:'units'
        },{
            title:'结存量',
            field:'disNum',
            value:0,
            editor: {
                type: 'numberbox', options: {
                    //precision: '2',
                    editable: false,
                    disabled: true
                }
            }
        },{
            title:'灭菌标志',
            field:'killflag',
            width:'8%',
            align:'center',
            formatter:function(value,row,index){
                if(value=='1'){
                    return '<input type="checkbox" name="DGC" checked="true" style="width: 15px" />';
                }
                if(value=='0'){
                    return '<input type="checkbox" name="DGC" style="width: 15px"/>';
                }else{//if(value==undefined){
                    return '<input type="checkbox" name="DGC" style="width: 15px"/>';
                }
            }
        }, {
            title: '子包装1',
            field: 'subPackage1',
            hidden:'true'
        }, {
            title: '子单位1',
            field: 'subPackageUnits1',
            hidden:'true'
        }, {
            title: '子规格1',
            field: 'subPackageSpec1',
            hidden:'true'
        }, {
            title: '子包装2',
            field: 'subPackage2',
            hidden:'true'
        }, {
            title: '子单位2',
            field: 'subPackageUnits2',
            hidden:'true'
        }, {
            title: '子规格2',
            field: 'subPackageSpec2',
            hidden:'true'
        }, {
            title: '入库单据号',
            field: 'importDocumentNo',
            hidden:'true'
        }, {
            title: '零售价',
            field: 'retailPrice',
            hidden:'true'
        }, {
            title: '批发价',
            field: 'tradePrice',
            hidden:'true'
        }]]
    }) ;
    //出库类别
    $("#exportClass").combobox({
        url: '/api/exp-export-class-dict/list',
        valueField: 'exportClass',
        textField: 'exportClass',
        method: 'GET',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            $(this).combobox('select', data[0].exportClass);
        }
    });
    var curr_time = new Date();
    $("#exportDate").datebox("setValue", myformatter2(curr_time));
    $("#documentNo").textbox({
        disabled: true
    });
    //创建出库单号
    var createNewDocument = function (subStorageCode) {
        var storage;
        var promise = $.get('/api/exp-sub-storage-dict/list-by-storage?storageCode=' + parent.config.storageCode + "&hospitalId=" + parent.config.hospitalId, function (data) {
            $.each(data, function (index, item) {
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
        });

        return promise;
    }
    //子库房
    $("#subStorage").combobox({
        url: '/api/exp-sub-storage-dict/list-by-storage?storageCode=' + parent.config.storageCode + "&hospitalId=" + parent.config.hospitalId,
        valueField: 'subStorage',
        textField: 'subStorage',
        method: 'GET',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            if (data.length > 0) {
                $(this).combobox('select', data[0].subStorage);
            }
        },
        onChange: function (newValue, oldValue) {
            var promise = createNewDocument(newValue);
            promise.done(function () {
                $("#documentNo").textbox('setValue', documentNo);
            })
        }
    });
    //开支类别
    $("#fundItem").combobox({
        url: '/api/exp-fund-item-dict/list',
        valueField: 'id',
        textField: 'fundItem',
        method: 'GET',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            if (data.length > 0) {
                $(this).combobox('select', data[0].fundItem);
            }
        }
    });
    //员工字典
    var people = {};
    var promise = $.get("/api/staff-dict/list-by-hospital?hospitalId=" + parent.config.hospitalId, function (data) {
        people = data;
        return people;
    });
    promise.done(function () {
        var staffSetting ={
            idField: 'loginName',
            textField: 'name',
            data: people,
            panelWidth: 300,
            columns: [[{
                title: '职称',
                field: 'title',
                width:'25%'
            }, {
                title: '工作类型',
                field: 'job',
                width:'20%'
            }, {
                title: '姓名',
                field: 'name',
                width:'20%'
            }]]
        };
        $("#storekeeper").combogrid(staffSetting);
        $("#principal").combogrid(staffSetting);
        $("#acctoperator").combogrid(staffSetting);
    });
    //科室字典
    var depts = {};
    var promise = $.get("/api/dept-dict/list?hospitalId=" + parent.config.hospitalId, function (data) {
        depts = data;
        return depts;
    });
    promise.done(function () {
        $("#receiver").combogrid({
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
    $("#addRow").on('click',function(){
        flag = 0 ;
        $("#exportDetail").datagrid('appendRow',{});
        var rows = $("#exportDetail").datagrid('getRows');
        var appendRowIndex = $("#exportDetail").datagrid('getRowIndex', rows[rows.length - 1]);

        if (editIndex || editIndex == 0) {
            $("#exportDetail").datagrid('endEdit', editIndex);
        }
        editIndex = appendRowIndex;
        $("#exportDetail").datagrid('beginEdit', editIndex);



    });
    $("#stockRecordDialog").dialog({
        title: '选择规格',
        //style="width:500px;height:300px;
        width: 1000,
        height: 300,
        closed: false,
        catch: false,
        modal: true,
        closed: true,
        onOpen: function () {
            $("#stockRecordDatagrid").datagrid({
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
                    title: '包装规格',
                    field: 'expSpec'
                }, {
                    title: '数量',
                    field: 'quantity'
                }, {
                    title: '包装单位',
                    field: 'units'
                }, {
                    title: '基本规格',
                    field: 'minSpec'
                }, {
                    title: '基本单位',
                    field: 'minUnits'
                }, {
                    title: '厂家',
                    field: 'firmId'
                }, {
                    title: '进价价',
                    field: 'purchasePrice'
                }, {
                    title: '批发价',
                    field: 'tradePrice'
                }, {
                    title: '零售价',
                    field: 'retailPrice'
                }, {
                    title: '批号',
                    field: 'batchNo'
                }, {
                    title: '有效期',
                    field: 'expireDate',
                    formatter:formatterDate
                }, {
                    title: '入库单号',
                    field: 'documentNo'
                }, {
                    title: '子包装1',
                    field: 'subPackage1'
                }, {
                    title: '子单位1',
                    field: 'subPackageUnits1'
                }, {
                    title: '子规格1',
                    field: 'subPackageSpec1'
                }, {
                    title: '子包装2',
                    field: 'subPackage2'
                }, {
                    title: '子单位2',
                    field: 'subPackageUnits2'
                }, {
                    title: '子规格2',
                    field: 'subPackageSpec2'
                }, {
                    title: '生产日期',
                    field: 'producedate',
                    formatter:formatterDate
                }, {
                    title: '消毒日期',
                    field: 'disinfectdate',
                    formatter:formatterDate
                }, {
                    title: '灭菌标识',
                    field: 'killflag'
                }, {
                    title: '产品类别',
                    field: 'expForm'
                }, {
                    title: '是否包装',
                    field: 'singleGroupIndicator'
                }]],
                onLoadSuccess:function(data){
                    flag = flag+1;
                    if(flag==2){
                        var dat ={};
                        dat= $("#stockRecordDatagrid").datagrid('getData');
                        if(dat.total==0 && editIndex!=undefined){
                            $("#exportDetail").datagrid('endEdit', editIndex);
                            $.messager.alert('系统提示','库房暂无该产品,请重置产品名称','info');
                            $("#stockRecordDialog").dialog('close');
                            $("#exportDetail").datagrid('beginEdit', editIndex);
                        }
                        flag=0;
                    }
                },
                onClickRow: function (index, row) {
                    $("#exportDetail").datagrid('endEdit', editIndex);
                    var rowDetail = $("#exportDetail").datagrid('getData').rows[editIndex];
                    rowDetail.expName = row.expName;
                    rowDetail.expForm = row.expForm;
                    rowDetail.expCode = row.expCode;
                    rowDetail.packageSpec = row.expSpec;
                    rowDetail.packageUnits = row.units;
                    rowDetail.disNum = row.quantity;
                    rowDetail.purchasePrice = row.purchasePrice;
                    rowDetail.amount = 0;
                    rowDetail.firmId = row.firmId;
                    rowDetail.batchNo = row.batchNo;
                    rowDetail.expireDate = row.expireDate;
                    rowDetail.producedate = row.producedate;
                    rowDetail.disinfectdate = row.disinfectdate;
                    rowDetail.killflag = row.killflag;
                    rowDetail.subPackage1 = row.subPackage1;
                    rowDetail.subPackageUnits1 = row.subPackageUnits1;
                    rowDetail.subPackageSpec1 = row.subPackageSpec1;
                    rowDetail.subPackage2 = row.subPackage2;
                    rowDetail.subPackageUnits2 = row.subPackageUnits2;
                    rowDetail.subPackageSpec2 = row.subPackageSpec2;
                    rowDetail.importDocumentNo = row.documentNo;
                    rowDetail.retailPrice = row.retailPrice;
                    rowDetail.tradePrice = row.tradePrice;
                    $("#exportDetail").datagrid('refreshRow',editIndex);
                    $("#stockRecordDialog").dialog('close');
                    $("#exportDetail").datagrid('beginEdit', editIndex);
                }
            });
            $("#stockRecordDatagrid").datagrid('load', {
                storageCode: parent.config.storageCode,
                expCode: currentExpCode,
                hospitalId: parent.config.hospitalId
            });

            var s = $("#stockRecordDatagrid").datagrid('getRows');
            $("#stockRecordDatagrid").datagrid('selectRow', 0);
        }
    });
    /**
     * 查询按钮
     */
    $("#searchBtn").on('click',function(){
        parent.addTab('出库单据查询', '/his/ieqm/exp-export-document-search');
    })
    /**
     * 删除按钮
     */
    $("#delRow").on('click', function () {
        var row = $("#exportDetail").datagrid('getSelected');
        if (row) {
            var index = $("#exportDetail").datagrid('getRowIndex', row);
            $("#exportDetail").datagrid('deleteRow', index);
            if (editIndex == index) {
                editIndex = undefined;
            }
        } else {
            $.messager.alert("系统提示", "请选择要删除的行", 'info');
        }
    });

    /**
     * 进行数据校验
     */
    var dataValid = function () {
        var rows = $("#exportDetail").datagrid('getRows');
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].quantity == 0) {
                $.messager.alert("系统提示", "第" + parseInt(i+1) + "行入库数量为0 请重新填写", 'error');
                $("#exportDetail").datagrid('beginEdit', i);
                return false;
            }
        }

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
        var rows = $("#exportDetail").datagrid('getRows');
        for (var i = 0; i < rows.length; i++) {
            if(rows[i].disNum<=0){
                $.messager.alert("系统提示", "第"+parseInt(i+1)+"行产品库房中不存在，不能出库", 'error');
                return false;
            }
        }
        return true;
    }
    var getCommitData = function(){
        var expExportMasterBeanChangeVo = {};
        expExportMasterBeanChangeVo.inserted = [];
        var exportMaster = {};
        exportMaster.documentNo = $("#documentNo").textbox('getValue');
        exportMaster.exportClass = $("#exportClass").combobox('getValue');
        exportMaster.exportDate = $("#exportDate").datebox('calendar').calendar('options').current;
        exportMaster.storage = parent.config.storageCode;
        exportMaster.receiver = $("#receiver").combogrid('getValue');
        exportMaster.accountReceivable = $("#accountReceivable").numberbox('getValue');
        exportMaster.accountPayed = $("#accountPayed").numberbox('getValue');
        exportMaster.additionalFee = $("#additionalFee").numberbox('getValue');
        exportMaster.subStorage = $("#subStorage").combobox('getValue');
        exportMaster.accountIndicator = 1;
        exportMaster.memos = $('#memos').textbox('getValue');
        exportMaster.fundItem = $('#fundItem').combogrid('getValue');
        exportMaster.operator = parent.config.loginName;
        exportMaster.principal = $("#principal").combogrid('getValue');
        exportMaster.storekeeper = $("#storekeeper").combogrid('getValue');
        exportMaster.acctoperator = parent.config.loginName;
        exportMaster.acctdate =new Date();
        exportMaster.principal = $("#principal").combogrid('getValue');
        exportMaster.storekeeper = $("#storekeeper").textbox('getValue');
        exportMaster.docStatus = 0;
        //exportMaster.auditor = $("#auditor").combobox('getValue');
        //exportMaster.rcptNo = $("#rcptNo").combobox('getValue');
        exportMaster.buyer = $("#acctoperator").combobox('getValue');
        exportMaster.hospitalId = parent.config.hospitalId;
        expExportMasterBeanChangeVo.inserted.push(exportMaster);

        //明细记录
        var expExportDetailBeanChangeVo = {};
        expExportDetailBeanChangeVo.inserted = [];

        var rows = $("#exportDetail").datagrid('getRows');

        for (var i = 0; i < rows.length; i++) {
            var detail = {};
            detail.documentNo = exportMaster.documentNo;
            detail.itemNo = i;
            var rowIndex = $("#exportDetail").datagrid('getRowIndex', rows[i]);
            detail.expCode = rows[i].expCode;
            detail.expSpec = rows[i].packageSpec;
            detail.units = rows[i].units;
            detail.batchNo = rows[i].batchNo;
            detail.importDocumentNo = rows[i].importDocumentNo;
            detail.retailPrice = rows[i].retailPrice;
            detail.tradePrice = rows[i].retailPrice;
            detail.packageSpec = rows[i].packageSpec;
            detail.packageUnits = rows[i].units;
            detail.quantity = rows[i].quantity;
            detail.subPackage1 = rows[i].subPackage1;
            detail.subPackageUnits1 = rows[i].subPackageUnits1;
            detail.subPackageSpec1 = rows[i].subPackageSpec1;
            detail.subPackage2 = rows[i].subPackage2;
            detail.subPackageUnits2 = rows[i].subPackageUnits2;
            detail.subPackageSpec2 = rows[i].subPackageSpec2;
            detail.purchasePrice = rows[i].purchasePrice;
            detail.expireDate = new Date(rows[i].expireDate);
            detail.expForm = rows[i].expForm;

            detail.firmId = rows[i].firmId;
            detail.inventory = rows[i].disNum;
            detail.producedate = new Date(rows[i].producedate);
            detail.disinfectdate = new Date(rows[i].disinfectdate);
            if($(rows[i].killflag).attr('type')=="checked"){
                detail.killflag = 1;

            }else{
               detail.killflag = 0;
            }
            //if($(input).is(":checked")){
            //    alert(5);
            //}
            //$("#order > thead > tr > td > input ").click(function(){
            //    if(this.checked){
            //        row.killflag=1;
            //        //做if条件判断，如果是被选中的，那么.....
            //    }
            //   // 或者
            //    if($(this).attr("type")=="checkbox"&&$(this).attr("type").prop("checked")){
            //    row.killflag=1;
            //    }
            //    //请问这里能用this关键字来查询么，因为当前对象已经是这个input了
            //})
            detail.assignCode = rows[i].assignCode;
            detail.bigCode = rows[i].expCode;
            detail.bigSpec = rows[i].packageSpec;
            detail.bigFirmId = rows[i].firmId;

            //detail.expSgtp = rows[i].expSgtp;
            detail.memo = rows[i].memo;
            detail.hospitalId = parent.config.hospitalId;
            expExportDetailBeanChangeVo.inserted.push(detail);
        }

        var importVo = {};
        importVo.expExportMasterBeanChangeVo = expExportMasterBeanChangeVo;
        importVo.expExportDetailBeanChangeVo = expExportDetailBeanChangeVo;
        return importVo ;
    }
    /**
     * 保存功能
     */
    $("#saveBtn").on('click', function () {
        if (editIndex || editIndex == 0) {
            $("#exportDetail").datagrid('endEdit', editIndex);
        }
        if (dataValid()) {
            var importVo = getCommitData() ;
            console.log(importVo);
            $.postJSON("/api/exp-stock/exp-export-manage", importVo, function (data) {
                $.messager.alert('系统提示', '出库成功', 'success');
                newDocument() ;
            }, function (data) {
                $.messager.alert("系统提示", data.errorMessage, 'error');
            })
        }
    });
    var newDocument = function () {
        //点击按钮调用的方法
        var subStorage = $("#subStorage").textbox('getValue');
        if(subStorage){
            var promise = createNewDocument(subStorage) ;
            promise.done(function(){
                $("#documentNo").textbox('setValue',documentNo);
            })
        }
        $("#exportDetail").datagrid('loadData',[]) ;

    }

    /**
     * 新单
     */
    $("#newBtn").on('click',function(){
        newDocument() ;
    })
})