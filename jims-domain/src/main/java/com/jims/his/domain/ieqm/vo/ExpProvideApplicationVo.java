package com.jims.his.domain.ieqm.vo;

import com.jims.his.domain.common.vo.BeanChangeVo;
import com.jims.his.domain.ieqm.entity.ExpProvideApplication;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;

/**
 * Created by tangxinbo on 2015/10/15
 */
@XmlRootElement
public class ExpProvideApplicationVo implements java.io.Serializable {
    private BeanChangeVo<ExpProvideApplication> changeVo;
    private String applicationId;
    private String expName;
    private String applicantStorage;
    private String applicantName;
    private String provideStorage;
    private String provideName;
    private Short itemNo;
    private String expCode;
    private String expSpec;
    private String packageSpec;
    private Double quantity;
    private String packageUnits;
    private Date enterDateTime;
    private String provideFlag;
    private String exportDocumentNo;
    private String applicantNo;
    private String applicationMan;
    private String patientId;
    private Byte visitId;
    private Boolean retflag;
    private Date retdate;
    private String retoperator;
    private String auditingOperator;
    private Double auditingQuantity;

    private String enterDate;
    private String deptName;
    private String name;



    private String deptId;
    private String expForm;
    private String importDocumentNo;
    private  String batchNo;
    private  Integer retailPrice;
    private  Integer disNum;
    private  Date producedate;
    private  Integer killflag;
    private Date expireDate;
    private Date disinfectdate;
    private String firmId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFirmId() {
        return firmId;
    }

    public void setFirmId(String firmId) {
        this.firmId = firmId;
    }

    public Integer getDisNum() {
        return disNum;
    }

    public void setDisNum(Integer disNum) {
        this.disNum = disNum;
    }

    public Date getProducedate() {
        return producedate;
    }

    public void setProducedate(Date producedate) {
        this.producedate = producedate;
    }

    public Integer getKillflag() {
        return killflag;
    }

    public void setKillflag(Integer killflag) {
        this.killflag = killflag;
    }

    public Date getDisinfectdate() {
        return disinfectdate;
    }

    public void setDisinfectdate(Date disinfectdate) {
        this.disinfectdate = disinfectdate;
    }




    public String getBatchNo() {
        return batchNo;
    }

    public void setBatchNo(String batchNo) {
        this.batchNo = batchNo;
    }

    public Integer getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(Integer retailPrice) {
        this.retailPrice = retailPrice;
    }

    public Date getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(Date expireDate) {
        this.expireDate = expireDate;
    }




    public ExpProvideApplicationVo(BeanChangeVo<ExpProvideApplication> changeVo, String applicationId, String expName, String applicantStorage, String applicantName, String provideStorage, String provideName, Short itemNo, String expCode, String expSpec, String packageSpec, Double quantity, String packageUnits, Date enterDateTime, String provideFlag, String exportDocumentNo, String applicantNo, String applicationMan, String patientId, Byte visitId, Boolean retflag, Date retdate, String retoperator, String auditingOperator, Double auditingQuantity, String enterDate, String deptName, String deptId, String expForm) {
        this.changeVo = changeVo;
        this.applicationId = applicationId;
        this.expName = expName;
        this.applicantStorage = applicantStorage;
        this.applicantName = applicantName;
        this.provideStorage = provideStorage;
        this.provideName = provideName;
        this.itemNo = itemNo;
        this.expCode = expCode;
        this.expSpec = expSpec;
        this.packageSpec = packageSpec;
        this.quantity = quantity;
        this.packageUnits = packageUnits;
        this.enterDateTime = enterDateTime;
        this.provideFlag = provideFlag;
        this.exportDocumentNo = exportDocumentNo;
        this.applicantNo = applicantNo;
        this.applicationMan = applicationMan;
        this.patientId = patientId;
        this.visitId = visitId;
        this.retflag = retflag;
        this.retdate = retdate;
        this.retoperator = retoperator;
        this.auditingOperator = auditingOperator;
        this.auditingQuantity = auditingQuantity;
        this.enterDate = enterDate;
        this.deptName = deptName;
        this.deptId = deptId;
        this.expForm = expForm;
    }

    public ExpProvideApplicationVo() {
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getProvideName() {
        return provideName;
    }

    public void setProvideName(String provideName) {
        this.provideName = provideName;
    }

    public BeanChangeVo<ExpProvideApplication> getChangeVo() {
        return changeVo;
    }

    public void setChangeVo(BeanChangeVo<ExpProvideApplication> changeVo) {
        this.changeVo = changeVo;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getExpName() {
        return expName;
    }

    public void setExpName(String expName) {
        this.expName = expName;
    }

    public String getApplicantStorage() {
        return applicantStorage;
    }

    public void setApplicantStorage(String applicantStorage) {
        this.applicantStorage = applicantStorage;
    }

    public String getProvideStorage() {
        return provideStorage;
    }

    public void setProvideStorage(String provideStorage) {
        this.provideStorage = provideStorage;
    }

    public Short getItemNo() {
        return itemNo;
    }

    public void setItemNo(Short itemNo) {
        this.itemNo = itemNo;
    }

    public String getExpCode() {
        return expCode;
    }
    public String getImportDocumentNo() {
        return importDocumentNo;
    }

    public void setImportDocumentNo(String importDocumentNo) {
        this.importDocumentNo = importDocumentNo;
    }

    public void setExpCode(String expCode) {
        this.expCode = expCode;
    }

    public String getExpSpec() {
        return expSpec;
    }

    public void setExpSpec(String expSpec) {
        this.expSpec = expSpec;
    }

    public String getPackageSpec() {
        return packageSpec;
    }

    public void setPackageSpec(String packageSpec) {
        this.packageSpec = packageSpec;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getPackageUnits() {
        return packageUnits;
    }

    public void setPackageUnits(String packageUnits) {
        this.packageUnits = packageUnits;
    }

    public Date getEnterDateTime() {
        return enterDateTime;
    }

    public void setEnterDateTime(Date enterDateTime) {
        this.enterDateTime = enterDateTime;
    }

    public String getProvideFlag() {
        return provideFlag;
    }

    public void setProvideFlag(String provideFlag) {
        this.provideFlag = provideFlag;
    }

    public String getExportDocumentNo() {
        return exportDocumentNo;
    }

    public void setExportDocumentNo(String exportDocumentNo) {
        this.exportDocumentNo = exportDocumentNo;
    }

    public String getApplicantNo() {
        return applicantNo;
    }

    public void setApplicantNo(String applicantNo) {
        this.applicantNo = applicantNo;
    }

    public String getApplicationMan() {
        return applicationMan;
    }

    public void setApplicationMan(String applicationMan) {
        this.applicationMan = applicationMan;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public Byte getVisitId() {
        return visitId;
    }

    public void setVisitId(Byte visitId) {
        this.visitId = visitId;
    }

    public Boolean getRetflag() {
        return retflag;
    }

    public void setRetflag(Boolean retflag) {
        this.retflag = retflag;
    }

    public Date getRetdate() {
        return retdate;
    }

    public void setRetdate(Date retdate) {
        this.retdate = retdate;
    }

    public String getRetoperator() {
        return retoperator;
    }

    public void setRetoperator(String retoperator) {
        this.retoperator = retoperator;
    }

    public String getAuditingOperator() {
        return auditingOperator;
    }

    public void setAuditingOperator(String auditingOperator) {
        this.auditingOperator = auditingOperator;
    }

    public Double getAuditingQuantity() {
        return auditingQuantity;
    }

    public void setAuditingQuantity(Double auditingQuantity) {
        this.auditingQuantity = auditingQuantity;
    }

    public String getEnterDate() {
        return enterDate;
    }

    public void setEnterDate(String enterDate) {
        this.enterDate = enterDate;
    }

    public String getDeptName() {
        return deptName;
    }

    public void setDeptName(String deptName) {
        this.deptName = deptName;
    }

    public String getDeptId() {
        return deptId;
    }

    public void setDeptId(String deptId) {
        this.deptId = deptId;
    }

    public String getExpForm() {
        return expForm;
    }

    public void setExpForm(String expForm) {
        this.expForm = expForm;
    }


}