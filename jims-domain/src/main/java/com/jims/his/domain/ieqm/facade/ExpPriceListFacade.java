package com.jims.his.domain.ieqm.facade;

import com.google.inject.persist.Transactional;
import com.jims.his.common.BaseFacade;
import com.jims.his.domain.ieqm.entity.ExpPriceList;
import com.jims.his.domain.ieqm.vo.ExpPriceListVo;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by wangjing on 2015/10/10.
 */
public class ExpPriceListFacade extends BaseFacade {
    private EntityManager entityManager;

    @Inject
    public ExpPriceListFacade(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * 根据expCode查询产品价格结果集
     * @param expCode
     * @return
     */
    public List<ExpPriceList> listExpPriceList(String expCode) {
        String hql = "from ExpPriceList as dict where dict.expCode='" + expCode + "'";
        Query query = entityManager.createQuery(hql);
        List resultList = query.getResultList();
        return resultList;
    }

    /**
     * 对EXP_PRICE_LIST和EXP_DICT联合查询，取出产品价格自定义对象ExpPriceListVo结果集
     * @param expCode
     * @return
     */
    public List<ExpPriceListVo> findExpPriceList(String expCode, String hospitalId) {
        String sql = "SELECT DISTINCT a.EXP_CODE, \n" +
                "         a.MATERIAL_CODE,   \n" +
                "         a.EXP_SPEC,   \n" +
                "         a.FIRM_ID,   \n" +
                "         a.UNITS,   \n" +
                "         a.TRADE_PRICE,   \n" +
                "         a.RETAIL_PRICE,   \n" +
                "         a.MAX_RETAIL_PRICE,   \n" +
                "         a.AMOUNT_PER_PACKAGE,   \n" +
                "         a.MIN_SPEC,   \n" +
                "         a.MIN_UNITS,   \n" +
                "         a.CLASS_ON_INP_RCPT,   \n" +
                "         a.CLASS_ON_OUTP_RCPT,   \n" +
                "         a.CLASS_ON_RECKONING,   \n" +
                "         a.SUBJ_CODE,   \n" +
                "         a.CLASS_ON_MR,   \n" +
                "         a.START_DATE,   \n" +
                "         a.STOP_DATE,   \n" +
                "         a.MEMOS,   \n" +
                "         b.EXP_NAME,\n" +
                "         a.PERMIT_NO,\n" +
                "\t\t\ta.PERMIT_DATE,\n" +
                "\t\t\ta.REGISTER_NO,\n" +
                "\t\t\ta.REGISTER_DATE,\n" +
                "\t\t\ta.FDA_OR_CE_NO,\n" +
                "\t\t\ta.FDA_OR_CE_DATE,\n" +
                "\t\t\ta.OTHER_NO,\n" +
                "\t\t\ta.OTHER_DATE   \n" +
                //"\t\t\ta.OTHER_DATE,   \n" +
                //"         ''  price_ratio,\n" +
                //"         ''  stop_price,   \n" +
                //"         '1' column_protect  \n" +
                "    FROM EXP_PRICE_LIST a,   \n" +
                "         EXP_DICT b   \n" +
                "   WHERE  a.EXP_CODE = b.EXP_CODE \n" +
                "     and ( a.STOP_DATE >= sysdate OR a.STOP_DATE is null ) \n" +
                "     and  a.START_DATE <= sysdate \n";
        if(null != expCode && !expCode.trim().equals("")){
            sql += "     AND    a.EXP_CODE ='" + expCode + "'";
        }
        if(null != hospitalId && !hospitalId.trim().equals("")){
            sql += "     AND    a.HOSPITAL_ID ='" + hospitalId + "'";
        }

        List<ExpPriceListVo> resultList = super.createNativeQuery(sql, new ArrayList<Object>(), ExpPriceListVo.class);
        return resultList;
    }

    /**
     * 保存产品价格
     * @param insertData
     * @return
     */
    @Transactional
    public List<ExpPriceList> saveExpPriceList(List<ExpPriceList> insertData) {

        List<ExpPriceList> newUpdateDict = new ArrayList<>();
        if (insertData.size() > 0) {
            for (ExpPriceList dict : insertData) {
                ExpPriceList merge = merge(dict);
                newUpdateDict.add(merge);
            }
        }
        return newUpdateDict;
    }

    /**
     * 对exp_dict , exp_price_list ,exp_stock联合查询，取出产品价格自定义对象ExpPriceListVo结果集
     * @param inputCode
     * @param StorageCode
     * @return
     */
    public List<ExpPriceListVo> findExpList(String inputCode ,String StorageCode){
        String sql = " SELECT B.EXP_NAME,\n" +
                "     c.EXP_CODE,\n" +
                "     c.EXP_SPEC,\n" +
                "     c.units,\n" +
                "     c.min_spec,\n" +
                "     c.min_UNITS,\n" +
                "     c.FIRM_ID,\n" +
                "     c.TRADE_PRICE,\n" +
                "     c.retail_price,\n" +
                "     c.Register_no,\n" +
                "     c.Permit_no,\n" +
                "     b.input_code\n" +
                "FROM exp_dict b, exp_price_list c,exp_stock d\n" +
                "WHERE b.EXP_CODE = c.EXP_CODE\n" +
                "AND   b.exp_spec = c.min_spec\n" +
                "and   c.EXP_CODE = d.exp_code(+)\n" +
                "and   c.min_SPEC = d.exp_spec(+)\n" +
                "and   c.firm_id = d.firm_id(+)\n" +
                "AND   c.start_date <= sysdate\n" +
                "AND   (c.stop_date IS NULL OR c.stop_date > sysdate)\n" +
                "and   d.storage(+) like '" + StorageCode + "'||'%'\n" +
                //"AND   b.EXP_CODE = '" + expCode + "'" +
                "and   upper(b.input_code) like upper('" + inputCode + "%')";
        return super.createNativeQuery(sql,new ArrayList<Object>(), ExpPriceListVo.class);
    }

    /**
     * 根据expCode，expSpec，firmId，units查询产品价格
     * @param expCode
     * @param expSpec
     * @param firmId
     * @param units
     * @return
     */
    public ExpPriceList getExpPriceList(String expCode, String expSpec, String firmId, String units){
        String hql = "from ExpPriceList pri where pri.expCode='" + expCode +"' and pri.expSpec='"
                + expSpec + "' and pri.firmId='" + firmId + "' and pri.units='" + units +"'";
        List resultList = this.entityManager.createQuery(hql).getResultList();
        if (resultList.size() > 0) {
            return(ExpPriceList)resultList.get(0);
        }else{
            return null;
        }
    }
}