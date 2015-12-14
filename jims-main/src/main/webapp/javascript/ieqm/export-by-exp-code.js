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

    //定义expName
    $('#expCode').combogrid({
        panelWidth: 500,
        idField: 'expCode',
        textField: 'expCode',
        loadMsg: '数据正在加载',
        url: "/api/exp-name-dict/list-exp-name-by-input",
        mode: 'remote',
        method: 'GET',
        columns: [[
            {field: 'expCode', title: '编码', width: 150, align: 'center'},
            {field: 'expName', title: '名称', width: 200, align: 'center'},
            {field: 'inputCode', title: '拼音', width: 50, align: 'center'}
        ]],
        pagination: false,
        fitColumns: true,
        rowNumber: true,
        autoRowHeight: false,
        pageSize: 50,
        pageNumber: 1
    });

    $("#dg").datagrid({
        title: '按单品种出库去向出库查询',
        fit: true,//让#dg数据创铺满父类容器
        toolbar: '#ft',
        footer: '#tb',
        singleSelect: true,
        columns: [[{
            title: '产品编码',
            field: 'expCode',
            width: "15%"
        },{
            title: '包装规格',
            field: 'packageSpec',
            width: "15%"
        }, {
            title: '单位',
            field: 'packageUnits',
            width: "15%"
        }, {
            title: '厂家',
            field: 'firmId',
            width: "15%"
        }, {
            title: '数量',
            field: 'quantity',
            width: "15%"
        }, {
            title: '金额',
            field: 'amount',
            width: "15%"
        }, {
            title: '去向库房',
            field: 'receiver',
            width: "15%"
        }]]
    });

    $("#search").on('click', function () {
        var startDate = $("#startDate").datetimebox('getText');
        var endDate = $("#endDate").datetimebox('getText');
        var expCode = $("#expCode").combogrid('getValue');
        var storageCode = parent.config.storageCode;
        var hospitalId = parent.config.hospitalId;
        $.get('/api/exp-export/export-detail-by-exp-class?type=expCode&storage=' + storageCode  + "&hospitalId=" + hospitalId + "&startDate=" + startDate + "&endDate=" + endDate+"&value="+ expCode, function (data) {
            if (data.length > 0) {
                var sumQuantity = 0.00;
                var sumAmount = 0.00;
                $.each(data, function (index, item) {
                    sumQuantity += item.quantity;
                    sumAmount += item.amount;
                });
                $("#dg").datagrid('loadData', data);
                $('#dg').datagrid('appendRow', {
                    firmId: "合计：",
                    quantity: sumQuantity,
                    amount: sumAmount
                });
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