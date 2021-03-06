package com.jims.his.domain.htca.entity;

import java.math.BigDecimal;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import org.hibernate.annotations.GenericGenerator;

/**
 * CalcIncomeDetailForHoliday entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "CALC_INCOME_DETAIL_FOR_HOLIDAY", schema = "HTCA")
public class CalcIncomeDetailForHoliday implements java.io.Serializable {

	// Fields

	private String id;
	private String orderedBy;
	private String performedBy;
	private BigDecimal totalCost;
	private String classOnRecking;
	private String incomeItemName;
	private String orderDoctor;
	private String performedDoctor;
	private String wardCode;
	private String yearMonth;
	private String incomeItemCode;
	private String inpOrOutp;
	private String hospitalId;
	private Double orderIncome;
	private Double performIncome;
	private Double wardIncome;

	// Constructors

	/** default constructor */
	public CalcIncomeDetailForHoliday() {
	}

	/** full constructor */
	public CalcIncomeDetailForHoliday(String orderedBy, String performedBy,
			BigDecimal totalCost, String classOnRecking, String incomeItemName,
			String orderDoctor, String performedDoctor, String wardCode,
			String yearMonth, String incomeItemCode, String inpOrOutp,
			String hospitalId, Double orderIncome,
            Double performIncome, Double wardIncome) {
		this.orderedBy = orderedBy;
		this.performedBy = performedBy;
		this.totalCost = totalCost;
		this.classOnRecking = classOnRecking;
		this.incomeItemName = incomeItemName;
		this.orderDoctor = orderDoctor;
		this.performedDoctor = performedDoctor;
		this.wardCode = wardCode;
		this.yearMonth = yearMonth;
		this.incomeItemCode = incomeItemCode;
		this.inpOrOutp = inpOrOutp;
		this.hospitalId = hospitalId;
		this.orderIncome = orderIncome;
		this.performIncome = performIncome;
		this.wardIncome = wardIncome;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "uuid.hex")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "ID", unique = true, nullable = false, length = 64)
	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Column(name = "ORDERED_BY", length = 100)
	public String getOrderedBy() {
		return this.orderedBy;
	}

	public void setOrderedBy(String orderedBy) {
		this.orderedBy = orderedBy;
	}

	@Column(name = "PERFORMED_BY", length = 100)
	public String getPerformedBy() {
		return this.performedBy;
	}

	public void setPerformedBy(String performedBy) {
		this.performedBy = performedBy;
	}

	@Column(name = "TOTAL_COST", precision = 22, scale = 0)
	public BigDecimal getTotalCost() {
		return this.totalCost;
	}

	public void setTotalCost(BigDecimal totalCost) {
		this.totalCost = totalCost;
	}

	@Column(name = "CLASS_ON_RECKING", length = 20)
	public String getClassOnRecking() {
		return this.classOnRecking;
	}

	public void setClassOnRecking(String classOnRecking) {
		this.classOnRecking = classOnRecking;
	}

	@Column(name = "INCOME_ITEM_NAME", length = 100)
	public String getIncomeItemName() {
		return this.incomeItemName;
	}

	public void setIncomeItemName(String incomeItemName) {
		this.incomeItemName = incomeItemName;
	}

	@Column(name = "ORDER_DOCTOR", length = 100)
	public String getOrderDoctor() {
		return this.orderDoctor;
	}

	public void setOrderDoctor(String orderDoctor) {
		this.orderDoctor = orderDoctor;
	}

	@Column(name = "PERFORMED_DOCTOR", length = 100)
	public String getPerformedDoctor() {
		return this.performedDoctor;
	}

	public void setPerformedDoctor(String performedDoctor) {
		this.performedDoctor = performedDoctor;
	}

	@Column(name = "WARD_CODE", length = 100)
	public String getWardCode() {
		return this.wardCode;
	}

	public void setWardCode(String wardCode) {
		this.wardCode = wardCode;
	}

	@Column(name = "YEAR_MONTH", length = 20)
	public String getYearMonth() {
		return this.yearMonth;
	}

	public void setYearMonth(String yearMonth) {
		this.yearMonth = yearMonth;
	}

	@Column(name = "INCOME_ITEM_CODE", length = 20)
	public String getIncomeItemCode() {
		return this.incomeItemCode;
	}

	public void setIncomeItemCode(String incomeItemCode) {
		this.incomeItemCode = incomeItemCode;
	}

	@Column(name = "INP_OR_OUTP", length = 1)
	public String getInpOrOutp() {
		return this.inpOrOutp;
	}

	public void setInpOrOutp(String inpOrOutp) {
		this.inpOrOutp = inpOrOutp;
	}

	@Column(name = "HOSPITAL_ID", length = 64)
	public String getHospitalId() {
		return this.hospitalId;
	}

	public void setHospitalId(String hospitalId) {
		this.hospitalId = hospitalId;
	}

	@Column(name = "ORDER_INCOME", precision = 22, scale = 0)
	public Double getOrderIncome() {
		return this.orderIncome;
	}

	public void setOrderIncome(Double orderIncome) {
		this.orderIncome = orderIncome;
	}

	@Column(name = "PERFORM_INCOME", precision = 22, scale = 0)
	public Double getPerformIncome() {
		return this.performIncome;
	}

	public void setPerformIncome(Double performIncome) {
		this.performIncome = performIncome;
	}

	@Column(name = "WARD_INCOME", precision = 22, scale = 0)
	public Double getWardIncome() {
		return this.wardIncome;
	}

	public void setWardIncome(Double wardIncome) {
		this.wardIncome = wardIncome;
	}

}