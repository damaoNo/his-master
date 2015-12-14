$.extend($.fn.datagrid.methods, {
    autoMergeCells: function (jq, fields) {
        return jq.each(function () {
            var target = $(this);
            if (!fields) {
                fields = target.datagrid("getColumnFields");
            }
            var rows = target.datagrid("getRows");
            var i = 0,
                j = 0,
                temp = {};
            for (i; i < rows.length; i++) {
                var row = rows[i];
                j = 0;
                for (j; j < fields.length; j++) {
                    var field = fields[j];
                    var tf = temp[field];
                    if (!tf) {
                        tf = temp[field] = {};
                        tf[row[field]] = [i];
                    } else {
                        var tfv = tf[row[field]];
                        if (tfv) {
                            tfv.push(i);
                        } else {
                            tfv = tf[row[field]] = [i];
                        }
                    }
                }
            }

            $.each(temp, function (field, colunm) {
                $.each(colunm, function () {
                    var group = this;
                    if (group.length > 1) {
                        var before,
                            after,
                            megerIndex = group[0];
                        for (var i = 0; i < group.length; i++) {
                            before = group[i];
                            after = group[i + 1];
                            if (after && (after - before) == 1) {
                                continue;
                            }
                            var rowspan = before - megerIndex + 1;
                            if (rowspan > 1) {
                                target.datagrid('mergeCells', {
                                    index: megerIndex,
                                    field: field,
                                    rowspan: rowspan
                                });
                            }
                            if (after && (after - before) != 1) {
                                megerIndex = after;
                            }
                        }
                    }
                });
            });
        });
    }
});

$(function () {
    var editIndex;
    var stopEdit = function () {
        if (editIndex || editIndex == 0) {
            $("#dg").datagrid('endEdit', editIndex);
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
            var h = date.getHours();
            var mm = date.getMinutes();
            var s = date.getSeconds();
            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' '
                + (h < 10 ? ("0" + h) : h) + ":" + (mm < 10 ? ("0" + mm) : mm) + ":" + (s < 10 ? ("0" + s) : s);
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

    $('#startDate').datetimebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
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

    $('#endDate').datetimebox({
        required: true,
        showSeconds: true,
        value: 'dateTime',
        formatter: formatterDate,
        onSelect: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var time = $('#endDate').datetimebox('spinner').spinner('getValue');
            var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d) + ' ' + time;
            $('#endDate').datetimebox('setText', dateTime);
            $('#endDate').datetimebox('hidePanel');
        }
    });
    //定义子库房
    var subStorages = [];
    var subStoragePromise = $.get('/api/exp-sub-storage-dict/list-by-storage?storageCode=' + parent.config.storageCode + "&hospitalId=" + parent.config.hospitalId, function (data) {
        $.each(data, function (index, item) {
            var ec = {};
            ec.storageCode = item.storageCode;
            ec.subStorage = item.subStorage;
            subStorages.push(ec);
        });
        var all = {};
        all.storageCode = '全部';
        all.subStorage = '全部';
        subStorages.unshift(all);

        $('#subStorage').combobox({
            panelHeight: 'auto',
            data: subStorages,
            valueField: 'storageCode',
            textField: 'subStorage'
        });
        $('#subStorage').combobox("select", "全部");
    });

    ////定义产品类别
    var forms = [];
    var formPromise = $.get("/api/exp-form-dict/list", function (data) {
        $.each(data, function (index, item) {
            var ec = {};
            ec.formCode = item.formCode;
            ec.formName = item.formName;
            forms.push(ec);
        });
        var all = {};
        all.formCode = '';
        all.formName = '全部';
        forms.unshift(all);

        $('#expForm').combobox({
            panelHeight: 'auto',
            data: forms,
            valueField: 'formCode',
            textField: 'formName'
        });
        $('#expForm').combobox("select", "全部");
    });
    //定义expName
    $("#expName").searchbox({
        searcher: function (value, name) {
            $("#dg").datagrid("unselectAll");
            var rows = $("#dg").datagrid("getRows");
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].expName == value) {
                    $("#dg").datagrid('selectRow', i);
                }
            }
        }
    });

    $("#dg").datagrid({
        title: '按子库房入库统计',
        fit: true,//让#dg数据创铺满父类容器
        toolbar: '#ft',
        footer: '#tb',
        singleSelect: false,
        nowrap: false,
        columns: [[{
            title: '代码',
            field: 'expCode',
            width: "10%"
        }, {
            title: '产品名称',
            field: 'expName',
            width: "10%"
        }, {
            title: '规格',
            field: 'packageSpec',
            width: "10%"
        }, {
            title: '单位',
            field: 'packageUnits',
            width: "10%"
        }, {
            title: '厂家',
            field: 'firmId',
            width: "10%"
        }, {
            title: '数量',
            field: 'quantity',
            width: "10%"
        }, {
            title: '批发价',
            field: 'tradePrice',
            width: "10%"
        }, {
            title: '进价金额',
            field: 'payAmount',
            width: "10%"
        }, {
            title: '零售价金额',
            field: 'purchaseAmount',
            width: "10%"
        }, {
            title: '类别',
            field: 'expForm',
            width: "10%"
        }]]
    });

    $("#search").on('click', function () {
        var startDate = $("#startDate").datetimebox('getText');
        var endDate = $("#endDate").datetimebox('getText');
        var subStorage = $("#subStorage").combobox("getText");
        var expForm = $("#expForm").combobox("getText");
        var storageCode = parent.config.storageCode;
        var hospitalId = parent.config.hospitalId;
        //
        $.get("/api/exp-import/exp-sub-import-detail?storage=" + storageCode + "&hospitalId=" + hospitalId + "&startDate=" + startDate + "&stopDate=" + endDate+"&subStorage="+ subStorage+"&expForm="+ expForm, function (data) {
            if (data.length > 0) {
                var sumPayAmount = 0.00;
                var sumPurchaseAmount = 0.00;
                $.each(data, function (index, item) {
                    sumPayAmount += item.payAmount;
                    sumPurchaseAmount += item.purchaseAmount;
                });
                $("#dg").datagrid('loadData', data);
                $('#dg').datagrid('appendRow', {
                    quantity: "合计：",
                    payAmount: sumPayAmount,
                    purchaseAmount: sumPurchaseAmount
                });
                $("#dg").datagrid("autoMergeCells", ['expCode', 'expName','packageSpec', 'packageUnits']);
            } else {
                $.messager.alert("提示", "起始时间段内无数据！")
            }
        });
    });
    $("#saveAs").on('click', function () {
        $.messager.alert("系统提示", "另存为", "info");
    });
    $("#print").on('click', function () {
        $.messager.alert("系统提示", "打印", "info");
    });
});