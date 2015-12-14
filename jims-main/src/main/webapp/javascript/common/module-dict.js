/**
 * Created by heren on 2015/9/16.
 */
/***
 * 系统模块维护
 */
$(function () {
    var editRowIndex;
    var menus = [];//菜单数组
    var menuTreeData = [];//菜单树对象
    $("#dg").datagrid({
        title: '模块名称维护',
        fit: true,//让#dg数据创铺满父类容器
        footer: '#tb',
        singleSelect: true,
        columns: [[{
            title: '编号',
            field: 'id',
            hidden: 'true'
        },{
            title: '模块名称',
            field: 'moduleName',
            width: "80%",
            editor: {
                type: 'validatebox', options: {
                    required: true, validType: 'length[0,128]', missingMessage: '请输入64个以内的汉字'
                }
            }
        },{
            title:'输入码',
            field:'inputCode',
            width:'20%'
        },{
            title:'模块权限Ids',
            field:'menuIds',
            editor: {
                type: 'textbox'
            }
            //hidden:true
        }]]
    });

    $("#searchBtn").on("click", function () {
        var name = $("#name").textbox("getValue");

        $.get("/api/module-dict/list?name=" + name, function (data) {
            $("#dg").datagrid('loadData', data);
        });
    });

    $("#addBtn").on('click', function () {

        $("#dg").datagrid('appendRow', {});
        var rows = $("#dg").datagrid('getRows');
        var row = rows[rows.length - 1];
        var index = $("#dg").datagrid('getRowIndex', row);

        $("#dg").datagrid('selectRow', index);
        if (editRowIndex == index) {
            $("#dg").datagrid('beginEdit', editRowIndex);
        }
        if (editRowIndex == undefined) {
            $("#dg").datagrid('beginEdit', index);
            editRowIndex = index;
        } else {
            $("#dg").datagrid('endEdit', editRowIndex);
            $("#dg").datagrid('beginEdit', index);
            editRowIndex = index;
        }
    });

    $("#delBtn").on('click', function () {
        var row = $("#dg").datagrid('getSelected');
        if (!row) {
            $.messager.alert("系统提醒", "请选择要删除的行", "error");
            return;
        }

        var index = $("#dg").datagrid('getRowIndex', row);

        if (index == editRowIndex) {
            editRowIndex = undefined;
        }
        $("#dg").datagrid('deleteRow', index);

    });

    $("#editBtn").on('click', function () {
        var row = $("#dg").datagrid('getSelected');
        if (!row) {
            $.messager.alert("系统提醒", "请选择要编辑的行", "error");
            return;
        }

        var index = $("#dg").datagrid('getRowIndex', row);

        if (editRowIndex == undefined) {

            $("#dg").datagrid("beginEdit", index);
            editRowIndex = index;
        } else {
            $("#dg").datagrid('endEdit', editRowIndex);
            $("#dg").datagrid('beginEdit', index);
            editRowIndex = index;
        }
    });

    var loadDict = function () {

        $.get("/api/module-dict/list", function (data) {
            $("#dg").datagrid('loadData', data);
        });
    }

    loadDict();


    /**
     * 保存修改的内容
     * 基础字典的改变，势必会影响其他的统计查询
     * 基础字典的维护只能在基础数据维护的时候使用。
     */
    $("#saveBtn").on('click', function () {
        if (editRowIndex) {
            $("#dg").datagrid('endEdit', editRowIndex);
            editRowIndex = undefined;
        }
        var insertData = $("#dg").datagrid('getChanges', 'inserted');
        var updateData = $("#dg").datagrid('getChanges', 'updated');
        var deleteData = $("#dg").datagrid('getChanges', 'deleted');

        var modulDictBeanChangeVo = {} ;
        modulDictBeanChangeVo.inserted=[] ;
        modulDictBeanChangeVo.deleted=[] ;
        modulDictBeanChangeVo.updated = [] ;

        for(var i = 0 ;i<insertData.length ;i++){
            var modulDict = {} ;
            modulDict.id = insertData[i].id ;
            modulDict.moduleName = insertData[i].moduleName ;
            modulDict.inputCode = insertData[i].inputCode ;
            modulDictBeanChangeVo.inserted.push(modulDict) ;
        }

        for(var i = 0 ;i<updateData.length ;i++){
            var modulDict = {} ;
            modulDict.id = updateData[i].id ;
            modulDict.moduleName = updateData[i].moduleName ;
            modulDict.inputCode = updateData[i].inputCode ;
            modulDictBeanChangeVo.updated.push(modulDict) ;
        }
        for(var i = 0 ;i<deleteData.length ;i++){
            var modulDict = {} ;
            modulDict.id = deleteData[i].id ;
            modulDict.moduleName = deleteData[i].moduleName ;
            modulDict.inputCode = deleteData[i].inputCode ;
            modulDictBeanChangeVo.deleted.push(modulDict) ;
        }

        $.postJSON("/api/module-dict/save",modulDictBeanChangeVo,function(data){
            $.messager.alert("系统提示","保存成功",'info') ;
        },function(data){
            $.messager.alert("系统提示",data.responseText.errorMessage,'error') ;
        })

    });


    //树定义
    $("#tt").tree({
        cascadeCheck:true,
        checkbox: true
    });

    var loadTreeData = function () {
        var promise = $.get("/api/menu/list", function (data) {
            $.each(data, function (index, item) {
                var menu = {};
                menu.attributes = {};
                menu.id = item.id;
                menu.text = item.menuName;
                menu.state = "open";
                menu.attributes.url = item.href;
                menu.attributes.parentId = item.parentId;
                menu.children = [];
                menus.push(menu);
            })

            for (var i = 0; i < menus.length; i++) {
                for (var j = 0; j < menus.length; j++) {
                    if (menus[i].id == menus[j].attributes.parentId) {
                        menus[i].children.push(menus[j]);
                    }
                }

                if (menus[i].children.length > 0 && !menus[i].attributes.parentId) {
                    menuTreeData.push(menus[i]);
                }

                if (!menus[i].attributes.parentId && menus[i].children.length <= 0) {
                    menuTreeData.push(menus[i]);
                }
            }
        });

        promise.done(function () {
            $("#tt").tree('loadData', menuTreeData);
        })
    }
    //加载菜单树数据
    loadTreeData();

    $("#menuAddBtn").on('click', function () {
        var row=$("#dg").datagrid('getSelected');
        if(!row){
            $.messager.alert('系统提示','请选择模块，然后在分配权限','error');
            return ;
        }
        $("#dlg").dialog('open').dialog('setTitle', '分配权限');
        var menuIds = row.menuIds ;
        if(!menuIds){
            return ;
        }
        var arr = new Array;
        arr = menuIds.split(",");
        for(i=0;i<arr.length;i++){

            var node=  $("#tt").tree('find',arr[i]) ;
            if(node !=null){
                var children = $("#tt").tree('getChildren',node.target); ;
                if(children.length > 0){
                    continue ;
                }
                $('#tt').tree('check', node.target);//将得到的节点选中
            }

        }
    });

    //全选
    $("#selectAllMenuBtn").on('click', function () {
        clearMenuBtn();
        var nodes =$('#tt').tree('getChecked',"unchecked");
        var flag = nodes.checked ? "uncheck" : "check";
        for(var i=0;i<nodes.length;i++){
            $('#tt').tree(flag, nodes[i].target);//将得到的节点选中
        }
    });
    //全不选
    $("#selectNoMenuBtn").on('click', function () {
        clearMenuBtn();
    });
    //清空选项
    var clearMenuBtn = function(){
        var nodes =$('#tt').tree('getChecked',['checked','indeterminate','unchecked']);
        var flag = nodes.checked ? "check" : "uncheck";
        for(var i=0;i<nodes.length;i++){
            $('#tt').tree(flag, nodes[i].target);//将得到的节点清空
        }
    }
    //保存分配的权限
    $("#saveMenuBtn").on('click',function(){

        var nodes=$("#tt").tree('getChecked',['checked','indeterminate']) ;
        console.log(nodes) ;
        var data = {} ;
        var row=$("#dg").datagrid('getSelected');
        if(!row.id){
            $.messager.alert("系统提示","请先保存模块然后在分配菜单","info") ;
            return ;
        }
        data.moduleId =row.id ;
        data.menuId=[] ;
        $.each(nodes,function(index,item){
            data.menuId.push(item.id) ;
        })

        $.postJSON("/api/module-dict/add-module-menu/"+data.moduleId,data.menuId,function(){
            $.messager.alert('系统提示','菜单分配成功','info');
            $("#dlg").dialog('close') ;
            $.each(nodes,function(index,item){
                $("#tt").tree('uncheck',item.target);
            })
            loadDict() ;
        },function(){
            $.messager.alert('系统提示','菜单分配失败','error');
        })

    })
})