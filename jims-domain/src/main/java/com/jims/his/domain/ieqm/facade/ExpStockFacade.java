package com.jims.his.domain.ieqm.facade;


import com.google.inject.persist.Transactional;
import com.jims.his.common.BaseFacade;
import com.jims.his.domain.common.vo.BeanChangeVo;
import com.jims.his.domain.ieqm.entity.*;
import com.jims.his.domain.ieqm.vo.*;
import com.sun.xml.internal.messaging.saaj.soap.impl.DetailImpl;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.xml.crypto.Data;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

/**
 * Created by wangbinbin on 2015/10/27.
 */
public class ExpStockFacade extends BaseFacade {
    private EntityManager entityManager;
    private ExpSubStorageDictFacade expSubStorageDictFacade ;//子库房维护
    private ExpExportDetailFacade expExportDetailFacade ;


    private ExpPriceModifyProfitFacade expPriceModifyProfitFacade ;//价格调整

    @Inject
    public ExpStockFacade(EntityManager entityManager, ExpSubStorageDictFacade expSubStorageDictFacade, ExpExportDetailFacade expExportDetailFacade, ExpPriceModifyProfitFacade expPriceModifyProfitFacade) {
        this.entityManager = entityManager;
        this.expSubStorageDictFacade = expSubStorageDictFacade;
        this.expExportDetailFacade = expExportDetailFacade;
        this.expPriceModifyProfitFacade = expPriceModifyProfitFacade;
    }

    /**
     * 查询
     * @param subStorage
     * @return
     */
    public List<ExpStock> listExpStock(String subStorage){
        String hql = "from ExpStock as dict";
        if(subStorage != null && subStorage.trim().length() > 0){
             hql+=" where dict.subStorage='" + subStorage + "'";
        }
        Query query = entityManager.createQuery(hql);
        List resultList = query.getResultList();
        return resultList;
    }
    //删除
    @Transactional
    public void saveStorage(List<ExpStorageZeroManageVo> deleteData) {
        if(deleteData.size()>0){
            List<String> ids = new ArrayList<>();
            for (ExpStorageZeroManageVo dict:deleteData){
                ids.add(dict.getId()) ;
            }
            super.removeByStringIds(ExpStock.class, ids);
        }
    }
    //提取
    public List<ExpStorageZeroManageVo> findStockZeroAll(String storageCode,String hospitalId) {
        String sql = "SELECT DISTINCT EXP_STOCK.STORAGE,   " +
                "                    EXP_STOCK.EXP_CODE, " +
                "EXP_STOCK.ID,   " +
                "EXP_STOCK.EXP_SPEC,   " +
                "EXP_STOCK.UNITS,   " +
                "EXP_STOCK.BATCH_NO,\n" +
                "EXP_STOCK.EXPIRE_DATE,   " +
                "EXP_STOCK.FIRM_ID,   " +
                "EXP_STOCK.PURCHASE_PRICE,   " +
                "EXP_STOCK.DISCOUNT,    " +
                "EXP_STOCK.PACKAGE_SPEC,\n" +
                "EXP_STOCK.QUANTITY,   " +
                "EXP_STOCK.PACKAGE_UNITS,    " +
                "EXP_STOCK.SUB_PACKAGE_1,    " +
                "EXP_STOCK.SUB_PACKAGE_UNITS_1,\n" +
                "EXP_STOCK.SUB_PACKAGE_2,   " +
                "EXP_STOCK.SUB_PACKAGE_UNITS_2,    " +
                "EXP_STOCK.SUB_STORAGE,   " +
                "EXP_STOCK.DOCUMENT_NO,   " +
                "EXP_DICT.EXP_NAME \n" +
                "  FROM EXP_STOCK, EXP_DICT \n" +
                "  WHERE ( EXP_STOCK.EXP_CODE = EXP_DICT.EXP_CODE(+) ) and  \n" +
                "        ( EXP_STOCK.EXP_SPEC = EXP_DICT.EXP_SPEC(+) ) AND  \n" +
                "        ( EXP_STOCK.QUANTITY <= 0 ) AND \n" +
                "        ( EXP_STOCK.STORAGE = '"+storageCode+"' ) AND"+
                "         exp_stock.hospital_id='"+hospitalId+"' ";

        List<ExpStorageZeroManageVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStorageZeroManageVo.class);
        return nativeQuery;
    }
    //查询exp_stock 的供应标志
    public List<ExpStorageZeroManageVo> findSupplyManage(String storageCode,String hospitalId) {
        String sql = "SELECT storage,exp_name,exp_stock.exp_code,exp_stock.id,exp_stock.exp_spec,package_spec,\n" +
                "package_units,firm_id,batch_no,quantity,supply_indicator,sub_storage \n" +
                "FROM exp_stock,exp_dict \n" +
                "WHERE exp_stock.exp_code = exp_dict.exp_code AND \n" +
                "\texp_stock.exp_spec = exp_dict.exp_spec  AND \n" +
                "storage = '"+storageCode+"' AND " +
               "exp_stock.hospital_id = '"+hospitalId+"' " ;
//                "supply_indicator = '"+supplyIndicator+"'"   ;

        List<ExpStorageZeroManageVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStorageZeroManageVo.class);
        return nativeQuery;

    }
    //修改exp_stock的供应标志
    @Transactional
    public List<ExpStorageZeroManageVo> saveStockSupplyManageUpdate(List<ExpStorageZeroManageVo> updateData) {
            List<ExpStorageZeroManageVo> newUpdateDict = new ArrayList<>() ;
            if(updateData.size()>0){
                for (ExpStorageZeroManageVo dict:updateData){
                    String id = dict.getId();
                    ExpStock expStock = get(ExpStock.class, id);
                    expStock.setSupplyIndicator(dict.getSupplyIndicator());
                    merge(expStock);
                }
                newUpdateDict.addAll(updateData);
            }
            return newUpdateDict ;
        }


    /**
     * 消耗品入库
     * @param importVo
     */
    @Transactional
    public void expImport(ExpImportVo importVo) {

        //1，更新库存信息
        updateStock(importVo) ;
        //2,保存入库单据 判断参数是否记账
        saveDocument(importVo) ;
        //3 ，计算并保存盈亏信息
        calcProfite(importVo) ;

    }

    /**
     * 计算入库造成的盈亏
     * @param importVo
     */
    private void calcProfite(ExpImportVo importVo) {
        List<ExpImportDetail> details = importVo.getExpImportDetailBeanChangeVo().getInserted() ;
        ExpImportMaster masters = importVo.getExpImportMasterBeanChangeVo().getInserted().get(0) ;
        for(ExpImportDetail importDetail :details){
            ExpPriceModifyProfit priceModifyProfit = expPriceModifyProfitFacade.calcExpPriceModifyPriceProfit(masters.getStorage(), importDetail.getExpCode(), importDetail.getExpSpec(), importDetail.getFirmId(), importDetail.getUnits(), importDetail.getQuantity(),importDetail.getHospitalId());
            if(priceModifyProfit !=null){
                merge(priceModifyProfit) ;
            }
        }
    }

    /**
     * 更新消耗品库存
     * @param importVo
     */
    private void updateStock(ExpImportVo importVo) {

        List<ExpImportDetail> details = importVo.getExpImportDetailBeanChangeVo().getInserted() ;
        List<ExpImportMaster> masters = importVo.getExpImportMasterBeanChangeVo().getInserted() ;
        String stockCode = masters.get(0).getStorage() ;
        String subStorage = masters.get(0).getSubStorage() ;
        for(ExpImportDetail detail:details){
            ExpStock expStock = this.getExpStock(stockCode,detail.getExpCode(),detail.getExpSpec(),detail.getBatchNo(), detail.getFirmId(),detail.getPackageSpec(),detail.getHospitalId()) ;
            if(expStock !=null){
                expStock.setQuantity(expStock.getQuantity() + detail.getQuantity());//更新库存
                expStock.setDiscount(detail.getDiscount());
                expStock.setSubStorage(subStorage);
                expStock.setDocumentNo(detail.getDocumentNo());
                expStock.setSupplyIndicator(1);
                expStock.setProducedate(detail.getProducedate());
                expStock.setDisinfectdate(detail.getDisinfectdate());
                expStock.setKillflag(detail.getKillflag());
                detail.setInventory(expStock.getQuantity() + detail.getQuantity());
                merge(expStock) ;
            }else{
                ExpStock stock = new ExpStock() ;
                stock.setStorage(stockCode);
                stock.setSubStorage(subStorage);
                stock.setExpCode(detail.getExpCode());
                stock.setExpSpec(detail.getExpSpec());
                stock.setUnits(detail.getUnits());
                stock.setBatchNo(detail.getBatchNo());
                stock.setExpireDate(detail.getExpireDate());
                stock.setFirmId(detail.getFirmId());
                stock.setPackageSpec(detail.getPackageSpec());
                stock.setQuantity(detail.getQuantity());
                stock.setPackageUnits(detail.getPackageUnits());
                stock.setDocumentNo(detail.getDocumentNo());
                stock.setPurchasePrice(detail.getPurchasePrice());
                stock.setDiscount(detail.getDiscount());
                stock.setProducedate(detail.getProducedate());
                stock.setDisinfectdate(detail.getDisinfectdate());

                //设置结存量
                detail.setInventory(detail.getQuantity());
                merge(stock) ;
            }

        }

    }

    /**
     * 保存入库单据
     * @param importVo
     */
    private void saveDocument(ExpImportVo importVo) {
        ExpImportMaster expImportMaster = importVo.getExpImportMasterBeanChangeVo().getInserted().get(0);
        ExpSubStorageDict subStorage = expSubStorageDictFacade.getSubStorage(expImportMaster.getStorage(), expImportMaster.getSubStorage(), expImportMaster.getHospitalId());
        subStorage.setImportNoAva(subStorage.getImportNoAva() +1 );
        merge(subStorage) ;//当前的单据号加1
        merge(expImportMaster) ;
        List<ExpImportDetail> details = importVo.getExpImportDetailBeanChangeVo().getInserted() ;
        for(ExpImportDetail detail:details){
            merge(detail) ;
        }
    }

    /**
     * 获取某一个消耗品的库存
     * @param storageCode 库存单位代码
     * @param expCode 消耗品代码
     * @param expSpec 消耗品规格
     * @param batchNo 消耗品批次
     * @param firmId 消耗品厂家
     * @param packageSpec 消耗品包装规格
     * @param hospitalId
     * @return
     */
    public ExpStock getExpStock(String storageCode, String expCode, String expSpec, String batchNo, String firmId, String packageSpec, String hospitalId){

        String hql = "from ExpStock as stock where stock.storage ='"+storageCode+"' and stock.expCode = '"+expCode+"' and expSpec = '"+expSpec+"'" +
                " and stock.batchNo = '"+batchNo+"' and stock.firmId = '"+firmId+"' and stock.packageSpec = '"+packageSpec+"' and stock.hospitalId = '"+hospitalId+"'" ;

        Query query = entityManager.createQuery(hql) ;

        List resultList = query.getResultList();
        if(resultList.size()>0){
            return (ExpStock) resultList.get(0);
        }else{
            return null ;
        }
    }


    /**
     * 批量入库
     * @param importVo
     */
    @Transactional
    public void expImportBatch(ExpImportVo importVo) {
        //1，更新库存信息
        updateStock(importVo) ;
        //2,保存入库单据 判断参数是否记账
        saveDocument(importVo) ;
        //3 ，计算并保存盈亏信息
        calcProfite(importVo) ;
        //4，更新入库单据
        BeanChangeVo<ExpExportDetialVo> expExportDetialVoBeanChangeVo = importVo.getExpExportDetialVoBeanChangeVo();
        List<ExpExportDetialVo> update = expExportDetialVoBeanChangeVo.getUpdated() ;
        if(update.size()>0){
            updateExpDetail(update) ;//设置使其更改rec_flag
        }
    }

    private void updateExpDetail(List<ExpExportDetialVo> update) {

        for(ExpExportDetialVo vo:update){

            ExpExportDetail detail = expExportDetailFacade.getDetail(vo.getHospitalId(),vo.getDocumentNo(),vo.getItemNo()) ;
            detail.setRecFlag(1);
            merge(detail) ;
        }

    }

    /**
     * 查询库存量及上下限及进价、批价、零价
     * @param storage
     * @param hospitalId
     * @return
     */
    public List<ExpStorageProfileVo> searchWarningStock(String storage, String hospitalId) {
        Date day = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd  HH:mm:ss");
        String startTime = formatter.format(day.getTime());
        String sql = "select a.exp_code,\n" +
                "       a.exp_spec,\n" +
                "       a.package_units,\n" +
                "       a.quantity stock_quantity,\n" +
                "       b.upper_level,\n" +
                "       b.low_level,\n" +
                "       c.exp_name,\n" +
                "       d.trade_price,\n" +
                "       d.retail_price\n" +
                " from exp_stock a, exp_storage_profile b, exp_dict c, exp_price_list d \n" +
                " where a.exp_code = b.exp_code(+)\n" +
                "   and a.storage = b.storage(+)\n" +
                "   and a.exp_spec = b.exp_spec\n" +
                "   and a.units = b.units(+)\n" +
                "   and a.storage = '"+storage+"'\n" +
                "   and a.hospital_id = '"+hospitalId+"'" +
                "   and a.exp_code = c.exp_code\n" +
                "   and a.exp_spec = c.exp_spec\n" +
                "   and a.units = c.units\n" +
                "   and a.exp_code = d.exp_code\n" +
                "   and a.exp_spec = d.exp_spec\n" +
                "   and (a.quantity>b.upper_level or  a.quantity<b.low_level)  \n" +
                "   and a.units = d.units\n" +
                "   and a.firm_id = d.firm_id\n" +
                "   and ((to_date ( '"+startTime+"' , 'yyyy-MM-dd HH24:MI:SS' ) > d.start_date and to_date ( '"+startTime+"' , 'yyyy-MM-dd HH24:MI:SS' ) < d.stop_date) or\n" +
                "       d.stop_date is null)";
        List<ExpStorageProfileVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStorageProfileVo.class);
        return nativeQuery;
    }

    /**
     * 过期产品统计
     * @param overDate 截至日期
     * @param storage  库房代码
     * @param hospitalId 医院Id
     * @return
     */
    public List<ExpStorageProfileVo> searchExpireStock(String overDate,String storage, String hospitalId) {
        String sql = "select a.exp_code,\n" +
                "       b.exp_name,\n" +
                "       a.exp_spec,\n" +
                "       a.units,\n" +
                "       a.batch_no,\n" +
                "       a.firm_id,\n" +
                "       a.expire_date,\n" +
                "       a.quantity,\n" +
                "       a.quantity * a.PURCHASE_PRICE stock_quantity\n" +
                "  from exp_stock a, exp_dict b\n" +
                " where expire_date < to_date('"+ overDate+"', 'yyyy-MM-dd HH24:MI:SS')\n" +
                " and a.exp_code = b.exp_code \n" +
                " and a.exp_spec = b.exp_spec\n" +
                " and a.units = b.units \n" +
                " And a.storage = '"+storage+"'\n" +
                " and a.hospital_id = '"+hospitalId+"'\n";
        List<ExpStorageProfileVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStorageProfileVo.class);
        return nativeQuery;
    }

    /**
     * 产品库存量查询
     * @param formClass  库存类型
     * @param storage    库房代码
     * @param hospitalId 医院Id
     * @param subStorageClass 子库房
     * @param supplier   供应商
     * @param expCode    消耗品代码
     * @return
     */
    public List<ExpStorageProfileVo> searchExpireStockNumber(String formClass, String storage, String hospitalId, String subStorageClass, String supplier, String expCode) {
        String sql = "select DISTINCT  a.sub_storage,\n" +
                "       b.exp_form,\n" +
                "       a.exp_code,\n" +
                "       b.exp_name,\n" +
                "       a.package_spec,\n" +
                "       a.firm_id,\n" +
                "       a.package_units,\n" +
                "       a.quantity,\n" +
                "       a.purchase_price,\n" +
                "       c.retail_price,\n" +
                "       a.quantity * c.retail_price retail_all_price ,\n" +
                "       a.quantity * a.purchase_price trade_all_price\n" +
                "  from exp_stock a, exp_dict b ,exp_price_list c \n" +
                "  where a.exp_code = b.exp_code \n" +
                "  and a.package_spec = b.exp_spec\n" +
                "  and a.package_units = b.units\n" +
                "  and a.exp_code = c.exp_code\n" +
                "  and a.package_spec = c.exp_spec\n" +
                "  and a.package_units = c.units \n" +
                "  and a.firm_id = c.firm_id \n" +
                "  and c.stop_date is null \n" +
                "  and a.storage = '"+storage+"' \n" +
                "  and a.hospital_id = '"+hospitalId+"'\n";
        if(subStorageClass != null && subStorageClass.trim().length() > 0){
            sql+=" and a.sub_storage='" + subStorageClass + "'";
        }
        if(formClass != null && formClass.trim().length() > 0){
            sql+=" and b.exp_form='" + formClass + "'";
        }
        if(supplier != null && supplier.trim().length() > 0){
            sql+=" and a.firm_id='" + supplier + "'";
        }
        if(expCode != null && expCode.trim().length() > 0){
            sql+=" and a.exp_code='" + expCode + "'";
        }
        List<ExpStorageProfileVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStorageProfileVo.class);
        return nativeQuery;
    }

    /**
     * 库存管理/产品入出存/入出存统计-月结
     * @param storageCode
     * @param hospitalId
     * @param startDate
     * @param endDate
     * @param expForm
     * @return
     */
    public List<ExpStockBalanceVo> getStockBalance(String storageCode, String hospitalId, String startDate, String endDate, String expForm) {
        String sql = " select exp_code,\n" +
                "           EXP_NAME,\n" +
                "           EXP_SPEC,\n" +
                "           FIRM_ID,\n" +
                "           PACKAGE_SPEC, \n" +
                "           PACKAGE_UNITS,\n" +
                "           EXP_FORM,\n" +
                "           sum(INITIAL_QUANTITY)  INITIAL_QUANTITY,\n" +
                "           sum(INITIAL_MONEY)  INITIAL_MONEY,\n" +
                "           sum(IMPORT_QUANTITY)  IMPORT_QUANTITY,\n" +
                "           sum(IMPORT_MONEY)  IMPORT_MONEY,\n" +
                "           SUM(EXPORT_MONEY)  EXPORT_MONEY,\n" +
                "           sum(EXPORT_QUANTITY) EXPORT_QUANTITY,         \n" +
                "           sum(INVENTORY) INVENTORY,\n" +
                "           sum(INVENTORY_MONEY) INVENTORY_MONEY,\n" +
                "           sum(PROFIT) PROFIT,\n" +
                "           sum(REAL_INITIAL_MONEY) REAL_INITIAL_MONEY,\n" +
                "           sum(REAL_IMPORT_MONEY) REAL_IMPORT_MONEY,\n" +
                "           sum(REAL_EXPORT_MONEY) REAL_EXPORT_MONEY,\n" +
                "           sum(REAL_INVENTORY_MONEY) REAL_INVENTORY_MONEY,\n" +
                "           sum(REAL_PROFIT) REAL_PROFIT\n" +
                "    from (\n" +
                "     SELECT DISTINCT EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS,\n" +
                "          EXP_DICT.EXP_FORM ,   \n" +
                "         0 INITIAL_QUANTITY,   \n" +
                "         0 INITIAL_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.IMPORT_QUANTITY)  IMPORT_QUANTITY,   \n" +
                "         sum(EXP_STOCK_BALANCE.IMPORT_MONEY)  IMPORT_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.EXPORT_QUANTITY)  EXPORT_QUANTITY,   \n" +
                "         sum(EXP_STOCK_BALANCE.EXPORT_MONEY)  EXPORT_MONEY,   \n" +
                "         0 INVENTORY,   \n" +
                "         0 INVENTORY_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.PROFIT)  PROFIT,   \n" +
                "         sum(EXP_STOCK_BALANCE.REAL_INITIAL_MONEY)  REAL_INITIAL_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.REAL_IMPORT_MONEY)  REAL_IMPORT_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.REAL_EXPORT_MONEY)  REAL_EXPORT_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.REAL_INVENTORY_MONEY)  REAL_INVENTORY_MONEY,   \n" +
                "         sum(EXP_STOCK_BALANCE.REAL_PROFIT)  REAL_PROFIT\n" +
                "     FROM EXP_DICT,   \n" +
                "          EXP_STOCK_BALANCE  \n" +
                "    WHERE ( EXP_STOCK_BALANCE.EXP_CODE = EXP_DICT.EXP_CODE(+)  )  AND  \n" +
                "         ( exp_stock_balance.exp_spec = exp_dict.exp_spec(+) ) ";
        if (storageCode != null && storageCode.trim().length() > 0) {
            sql += " and EXP_STOCK_BALANCE.STORAGE = '" + storageCode + "'";
        }
        //if (hospitalId != null && hospitalId.trim().length() > 0) {
        //    sql += " '" + hospitalId + "'";
        //}
        if (startDate != null && startDate.trim().length() > 0) {
            sql += " and to_CHAR(EXP_STOCK_BALANCE.YEAR_MONTH,'YYYY-MM')  >='" + startDate + "'";
        }
        if (endDate != null && endDate.trim().length() > 0) {
            sql += " and to_CHAR(EXP_STOCK_BALANCE.YEAR_MONTH,'YYYY-MM')  <='" + endDate + "'";
        }
        if (expForm != null && !expForm.trim().equals("全部")) {
            sql += " and EXP_DICT.EXP_FORM='" + expForm + "'";
        }
        sql += "group by EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS,\n" +
                "         EXP_DICT.EXP_FORM \n" +
                "  union all       \n" +
                "   SELECT DISTINCT EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS,\n" +
                "         EXP_DICT.EXP_FORM,  \n" +
                "         sum(EXP_STOCK_BALANCE.INITIAL_QUANTITY) INITIAL_QUANTITY,   \n" +
                "         sum(EXP_STOCK_BALANCE.INITIAL_MONEY) INITIAL_MONEY,   \n" +
                "         0 IMPORT_QUANTITY,   \n" +
                "         0 IMPORT_MONEY,   \n" +
                "         0 EXPORT_QUANTITY,   \n" +
                "         0 EXPORT_MONEY,   \n" +
                "         0 INVENTORY,   \n" +
                "         0 INVENTORY_MONEY,   \n" +
                "         0 PROFIT,   \n" +
                "         0 REAL_INITIAL_MONEY,   \n" +
                "         0 REAL_IMPORT_MONEY,   \n" +
                "         0 REAL_EXPORT_MONEY,   \n" +
                "         0 REAL_INVENTORY_MONEY,   \n" +
                "         0 REAL_PROFIT \n" +
                "    FROM EXP_DICT,   \n" +
                "         EXP_STOCK_BALANCE  \n" +
                "   WHERE ( EXP_STOCK_BALANCE.EXP_CODE = EXP_DICT.EXP_CODE(+)  )  AND \n" +
                "         ( exp_stock_balance.exp_spec = exp_dict.exp_spec(+) ) ";
        if (storageCode != null && storageCode.trim().length() > 0) {
            sql += " and EXP_STOCK_BALANCE.STORAGE = '" + storageCode + "'";
        }
        //if (hospitalId != null && hospitalId.trim().length() > 0) {
        //    sql += " '" + hospitalId + "'";
        //}
        if (startDate != null && startDate.trim().length() > 0) {
            sql += " and to_CHAR(EXP_STOCK_BALANCE.YEAR_MONTH,'YYYY-MM')='" + startDate + "'";
        }
        if (expForm != null && !expForm.trim().equals("全部")) {
            sql += " and EXP_DICT.EXP_FORM='" + expForm + "'";
        }
        sql +="group by EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS,\n" +
                "         EXP_DICT.EXP_FORM   \n" +
                "   union all\n" +
                "   SELECT DISTINCT EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS, \n" +
                "         EXP_DICT.EXP_FORM, \n" +
                "         0 INITIAL_QUANTITY,   \n" +
                "         0 INITIAL_MONEY,   \n" +
                "         0 IMPORT_QUANTITY,   \n" +
                "         0 IMPORT_MONEY,   \n" +
                "         0 EXPORT_QUANTITY,   \n" +
                "         0 EXPORT_MONEY,   \n" +
                "         sum(INVENTORY) INVENTORY,   \n" +
                "         sum(INVENTORY_MONEY) INVENTORY_MONEY,   \n" +
                "         0 PROFIT,   \n" +
                "         0 REAL_INITIAL_MONEY,   \n" +
                "         0 REAL_IMPORT_MONEY,   \n" +
                "         0 REAL_EXPORT_MONEY,   \n" +
                "         0 REAL_INVENTORY_MONEY,   \n" +
                "         0 REAL_PROFIT           \n" +
                "    FROM EXP_DICT,   \n" +
                "         EXP_STOCK_BALANCE  \n" +
                "   WHERE ( EXP_STOCK_BALANCE.EXP_CODE = EXP_DICT.EXP_CODE(+)  )  AND  \n" +
                "         ( exp_stock_balance.exp_spec = exp_dict.exp_spec(+) ) ";
        if (storageCode != null && storageCode.trim().length() > 0) {
            sql += " and EXP_STOCK_BALANCE.STORAGE = '" + storageCode + "'";
        }
        //if (hospitalId != null && hospitalId.trim().length() > 0) {
        //    sql += " '" + hospitalId + "'";
        //}
        if (endDate != null && endDate.trim().length() > 0) {
            sql += " and to_CHAR(EXP_STOCK_BALANCE.YEAR_MONTH,'YYYY-MM')='" + endDate + "'";
        }
        if (expForm != null && !expForm.trim().equals("全部")) {
            sql += " and EXP_DICT.EXP_FORM='" + expForm + "'";
        }
        sql +="group by EXP_DICT.EXP_NAME,   \n" +
                "         EXP_STOCK_BALANCE.STORAGE,   \n" +
                "         EXP_STOCK_BALANCE.YEAR_MONTH,   \n" +
                "         EXP_STOCK_BALANCE.EXP_CODE,   \n" +
                "         EXP_STOCK_BALANCE.EXP_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.FIRM_ID,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_SPEC,   \n" +
                "         EXP_STOCK_BALANCE.PACKAGE_UNITS,\n" +
                "         EXP_DICT.EXP_FORM\n" +
                " ) \n" +
                "   group by  exp_code,\n" +
                "           EXP_NAME,\n" +
                "           EXP_SPEC,\n" +
                "           FIRM_ID,\n" +
                "           PACKAGE_SPEC, \n" +
                "           PACKAGE_UNITS,\n" +
                "           EXP_FORM ";
        List<ExpStockBalanceVo> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStockBalanceVo.class);
        return nativeQuery;
    }

    public List<ExpStockRecord> expExportStockRe(String storageCode, String hospitalId, String expCode) {
        String sql="SELECT          exp_name,\n" +
                "                   exp_price_list.min_spec,\n" +
                "                   exp_price_list.exp_code,\n" +
                "                   exp_price_list.min_units,\n" +
                "                   batch_no,\n" +
                "                   expire_date,\n" +
                "                   exp_price_list.firm_id,\n" +
                "                   nvl(purchase_price,0) purchase_price,\n" +
                "                   discount,\n" +
                "                   exp_price_list.exp_spec,\n" +
                "                   nvl(quantity,0) quantity,\n" +
                "                   exp_price_list.units,\n" +
                "                   document_no,\n" +
                "                   sub_package_1,\n" +
                "                   sub_package_units_1,\n" +
                "                   sub_package_spec_1,\n" +
                "                   sub_package_2,\n" +
                "                   sub_package_units_2,\n" +
                "                   sub_package_spec_2,\n" +
                "                   Sign(expire_date - sysdate) indicator ,\n" +
                "                   ProduceDate,\n" +
                "                   DisinfectDate,\n" +
                "                   KillFlag,\n" +
                "                   nvl(trade_price,0) trade_price,\n" +
                "                   nvl(retail_price,0) retail_price,\n" +
                "                   exp_dict.exp_form,\n" +
                "                   nvl(exp_dict.single_group_indicator,'S') single_group_indicator\n" +
                "FROM  exp_stock,exp_dict,exp_price_list\n" +
                "WHERE exp_price_list.exp_code = exp_dict.exp_code\n" +
                "and   exp_stock.exp_code(+) = exp_price_list.exp_code\n" +
                "and   exp_stock.exp_spec(+) = exp_price_list.exp_spec\n" +
                "and   exp_stock.firm_id(+)  = exp_price_list.firm_id\n" +
                "AND   exp_price_list.start_date <= sysdate\n" +
                "AND   (exp_price_list.stop_date IS NULL OR exp_price_list.stop_date > sysdate)\n" +
                "AND   exp_stock.SUPPLY_INDICATOR(+) = 1\n" +
                "and   exp_stock.storage = '"+storageCode+"'\n" +
                "and   exp_stock.hospital_id = '"+hospitalId+"'\n" +
                "AND   exp_dict.exp_code = '"+expCode+"'";
        List<ExpStockRecord> nativeQuery = super.createNativeQuery(sql, new ArrayList<Object>(), ExpStockRecord.class);
        return nativeQuery;
    }

    /**
     * 消耗品出库
     * @param exportVo
     */
    @Transactional
    public void expExportManage(ExpExportManageVo exportVo) {

        //1，更新库存信息
        updateExportStock(exportVo) ;
        //2,保存入库单据 判断参数是否记账
        saveExportDocument(exportVo) ;

    }
    /**
     * 更新消耗品库存
     * @param exportVo
     */
    private void updateExportStock(ExpExportManageVo exportVo) {

        List<ExpExportDetail> details = exportVo.getExpExportDetailBeanChangeVo().getInserted() ;
        List<ExpExportMaster> masters = exportVo.getExpExportMasterBeanChangeVo().getInserted() ;
        String stockCode = masters.get(0).getStorage() ;
        for(ExpExportDetail detail:details){
            ExpStock expStock = this.getExpStock(stockCode,detail.getExpCode(),detail.getExpSpec(),detail.getBatchNo(), detail.getFirmId(),detail.getPackageSpec(),detail.getHospitalId()) ;
            if(expStock !=null){
                expStock.setQuantity(expStock.getQuantity() - detail.getQuantity());//更新库存
                detail.setInventory(expStock.getQuantity() - detail.getQuantity());
                merge(expStock) ;
            }

        }

    }

    /**
     * 保存入库单据
     * @param exportVo
     */
    private void saveExportDocument(ExpExportManageVo exportVo) {
        ExpExportMaster expExportMaster = exportVo.getExpExportMasterBeanChangeVo().getInserted().get(0);
        ExpSubStorageDict subStorage = expSubStorageDictFacade.getSubStorage(expExportMaster.getStorage(), expExportMaster.getSubStorage(), expExportMaster.getHospitalId());
        subStorage.setExportNoAva(subStorage.getExportNoAva() + 1);
        merge(subStorage) ;//当前的单据号加1
        merge(expExportMaster) ;
        List<ExpExportDetail> details = exportVo.getExpExportDetailBeanChangeVo().getInserted() ;
        for(ExpExportDetail detail:details){
            merge(detail) ;
        }
    }

    /**
     * 对消入出库保存
     * @param portVo
     */
    @Transactional
    public void expExportImport(ExpExportImportVo portVo) {
        if(null != portVo){
            ExpExportManageVo exportVo = portVo.getExportVo();
            ExpImportVo importVo = portVo.getImportVo();
            if(null != importVo) {
                //1，更新库存信息
                updateStock(importVo);
                //2,保存入库单据 判断参数是否记账
                saveDocument(importVo);
                //3 ，计算并保存盈亏信息
                calcProfite(importVo);
            }
            if(null != exportVo){
                //1，更新库存信息
                updateExportStock(exportVo);
                //2,保存入库单据 判断参数是否记账
                saveExportDocument(exportVo);
            }
        }


    }
}