import type { CalculatorAssumptions, CalculatorResults, ScenarioId } from "@/types/calculator";
import { defaultAssumptions, scenarioOverrides } from "@/data/libert-calculator-defaults";

const clamp = (value: number, min = 0, max = Number.POSITIVE_INFINITY) => Math.min(max, Math.max(min, value));
const ceil = (value: number) => Math.ceil(clamp(value));
const safeDivide = (a: number, b: number) => (b > 0 ? a / b : 0);

function mergeScenario(scenario: ScenarioId): CalculatorAssumptions {
  const override = scenarioOverrides[scenario];
  return {
    ...defaultAssumptions,
    ...override,
    fleet: { ...defaultAssumptions.fleet, ...override.fleet },
    offer: { ...defaultAssumptions.offer, ...override.offer },
    marketing: { ...defaultAssumptions.marketing, ...override.marketing },
    sales: { ...defaultAssumptions.sales, ...override.sales },
    operations: { ...defaultAssumptions.operations, ...override.operations },
    credit: { ...defaultAssumptions.credit, ...override.credit },
    financing: { ...defaultAssumptions.financing, ...override.financing },
    taxes: { ...defaultAssumptions.taxes, ...override.taxes },
  };
}

export function getScenarioAssumptions(scenario: ScenarioId) {
  return mergeScenario(scenario);
}

export function calculateLibertDrive(input: CalculatorAssumptions): CalculatorResults {
  const fleet = input.fleet;
  const offer = input.offer;
  const marketing = input.marketing;
  const sales = input.sales;
  const operations = input.operations;
  const credit = input.credit;
  const financing = input.financing;
  const taxes = input.taxes;

  const occupiedCars = fleet.totalCars * fleet.occupancyRate;
  const inactiveCars = ceil(fleet.totalCars * fleet.downtimeRate);
  const activeCars = clamp(Math.round(occupiedCars - inactiveCars), 0, fleet.totalCars);
  const perCarFixedCost =
    fleet.monthlyVehicleRental +
    fleet.insurancePerCar +
    fleet.telemetryPerCar +
    fleet.maintenancePerCar +
    fleet.cleaningPerCar +
    fleet.yardPerCar +
    fleet.adminPerCar;
  const chargingCost = fleet.chargingIncluded ? activeCars * fleet.monthlyKmPerDriver * fleet.electricCostPerKm : 0;
  const incidentProvision = fleet.totalCars * fleet.incidentRate * fleet.avgIncidentCost;
  const extraKmPerDriver = Math.max(0, fleet.monthlyKmPerDriver - fleet.monthlyKmAllowance);
  const extraKmCost = activeCars * extraKmPerDriver * fleet.extraKmFee;
  const totalFleetCost = fleet.totalCars * perCarFixedCost + chargingCost + incidentProvision + extraKmCost;
  const lostRevenueFromDowntime = inactiveCars * offer.monthlyPrice;
  const monthlyEnergySavingsForDrivers = activeCars * fleet.monthlyKmPerDriver * Math.max(0, fleet.gasolineCostPerKm - fleet.electricCostPerKm);

  const leads = safeDivide(marketing.monthlyMediaSpend, marketing.cpl);
  const whatsapp = leads * marketing.leadToWhatsappRate;
  const webinar = whatsapp * marketing.whatsappToWebinarRate * marketing.attendanceRate;
  const applications = webinar * marketing.applicationRate;
  const approved = applications * marketing.approvalRate;
  const contracts = approved * marketing.closeRate;
  const activatedContracts = contracts * marketing.activationRate;
  const leadToActivatedRate = safeDivide(activatedContracts, leads);
  const requiredMediaToFillFleet = safeDivide(fleet.totalCars, leadToActivatedRate) * marketing.cpl;
  const averageDownPayment = (financing.downPaymentMin + financing.downPaymentMax) / 2;
  const monthlyBridgeCapacity = Math.min(
    safeDivide(activeCars, financing.deliveryLeadMonths),
    safeDivide(financing.cohortSize, financing.cohortCadenceMonths),
  );
  const newOwnershipContracts = clamp(activatedContracts * financing.ownershipConversionRate, 0, monthlyBridgeCapacity);
  const bridgeCarsInUse = clamp(Math.round(newOwnershipContracts * financing.deliveryLeadMonths), 0, activeCars);
  const rentalOnlyCars = Math.max(0, activeCars - bridgeCarsInUse);
  const installmentContracts = Math.max(financing.activeInstallmentContracts, bridgeCarsInUse);
  const deliveredInstallmentContracts = Math.max(0, installmentContracts - bridgeCarsInUse);
  const downPaymentCash = newOwnershipContracts * averageDownPayment * financing.retainedDownPaymentRate;
  const installmentRevenue = installmentContracts * financing.monthlyInstallment * financing.retainedInstallmentRate;
  const cycleDownPaymentCash = financing.cohortSize * averageDownPayment * financing.retainedDownPaymentRate;
  const annualOwnershipDeliveries = Math.min(
    safeDivide(activeCars * 12, financing.deliveryLeadMonths),
    safeDivide(financing.cohortSize * 12, financing.cohortCadenceMonths),
  );
  const releasedCarsPerCycle = Math.min(financing.cohortSize, activeCars);

  const sdrs = sales.manualSdrs > 0 ? sales.manualSdrs : ceil(leads / sales.leadsPerSdr);
  const closers = sales.manualClosers > 0 ? sales.manualClosers : ceil(approved / sales.opportunitiesPerCloser);
  const supportAgents = ceil((activeCars * operations.ticketsPerDriver) / operations.ticketsPerAgent);
  const fleetManagers = ceil(fleet.totalCars / operations.carsPerFleetManager);
  const operators = ceil(activatedContracts / operations.deliveriesPerOperator);
  const creditAnalysts = ceil(applications / operations.applicationsPerCreditAnalyst);

  const recurringRevenue = rentalOnlyCars * offer.monthlyPrice * (1 - offer.averageDiscountRate) + installmentRevenue;
  const activationRevenue = activatedContracts * offer.activationFee;
  const entryRevenue = activatedContracts * offer.entryFee + downPaymentCash;
  const consortiumRevenue = activeCars * credit.consortiumInterestRate * credit.consortiumConversionRate * credit.consortiumCommission;
  const creditPartnerRevenue = activeCars * credit.consortiumInterestRate * credit.consortiumConversionRate * credit.creditPartnerRevenue;
  const complementaryRevenue = activeCars * offer.additionalRevenuePerDriver + consortiumRevenue + creditPartnerRevenue;
  const grossRevenue = recurringRevenue + activationRevenue + entryRevenue + complementaryRevenue;
  const deductions = grossRevenue * taxes.revenueTaxRate;
  const netRevenue = grossRevenue - deductions;

  const defaultLoss = recurringRevenue * offer.defaultRate * (1 - offer.defaultRecoveryRate);
  const churnLoss = recurringRevenue * offer.churnRate;
  const creditRiskProvision = (consortiumRevenue + creditPartnerRevenue + downPaymentCash + installmentRevenue) * credit.riskProvisionRate;
  const complianceCost = (activatedContracts + newOwnershipContracts) * credit.complianceCostPerOperation;
  const provisions = defaultLoss + churnLoss + creditRiskProvision + complianceCost;
  const directCosts = totalFleetCost + provisions;
  const grossMargin = netRevenue - directCosts;

  const marketingCost = marketing.monthlyMediaSpend + marketing.launchProductionCost + marketing.toolsCost + marketing.agencyCost;
  const salesCost = sdrs * sales.sdrSalary + closers * sales.closerSalary + sales.salesManagerSalary + activatedContracts * sales.commissionPerContract;
  const supportOpsCost =
    supportAgents * operations.supportAgentSalary +
    fleetManagers * operations.fleetManagerSalary +
    operators * operations.operatorSalary +
    creditAnalysts * operations.creditAnalystSalary +
    operations.collectionCost +
    operations.vehicleRecoveryCost;
  const adminCost = operations.fixedAdminCost + operations.legalComplianceCost + operations.technologyCost;
  const ebitda = grossMargin - marketingCost - salesCost - supportOpsCost - adminCost;
  const profitTax = Math.max(0, ebitda * taxes.profitTaxRate);
  const netProfit = ebitda - profitTax;
  const fixedCashNeed = (marketingCost + salesCost + supportOpsCost + adminCost) * taxes.cashReserveMonths;
  const cashNeed = Math.max(0, fixedCashNeed + totalFleetCost - taxes.initialCash);
  const cashAfterMonth = taxes.initialCash + netProfit;

  const cacMarketing = safeDivide(marketing.monthlyMediaSpend, activatedContracts);
  const cacTotal = safeDivide(marketingCost + salesCost, activatedContracts);
  const roas = safeDivide(grossRevenue, marketing.monthlyMediaSpend);
  const revenuePerActiveCar = safeDivide(recurringRevenue + complementaryRevenue, activeCars);
  const contributionPerCar = safeDivide(grossMargin, activeCars);
  const fixedExpenses = marketingCost + salesCost + supportOpsCost + adminCost;
  const breakEvenCars = contributionPerCar > 0 ? ceil(safeDivide(fixedExpenses, contributionPerCar)) : null;
  const marginPerDriver = Math.max(0, contributionPerCar);
  const ltv = marginPerDriver * offer.averageContractMonths;
  const ltvCac = safeDivide(ltv, cacTotal);
  const paybackMonths = safeDivide(cacTotal, marginPerDriver);
  const ebitdaMargin = safeDivide(ebitda, netRevenue);
  const projectionRamp = [0.35, 0.55, 0.72, 0.86, 1, 1.12, 1.24, 1.36, 1.48, 1.6, 1.72, 1.84];
  let rollingCash = taxes.initialCash;
  const projection = projectionRamp.map((ramp, index) => {
    const month = index + 1;
    const projectedActiveCars = clamp(Math.round(activeCars * ramp), 0, fleet.totalCars);
    const projectedBridgeCarsInUse = clamp(Math.round(bridgeCarsInUse * ramp), 0, projectedActiveCars);
    const projectedRentalOnlyCars = Math.max(0, projectedActiveCars - projectedBridgeCarsInUse);
    const projectedInstallmentContracts = Math.max(
      projectedBridgeCarsInUse,
      Math.round(financing.activeInstallmentContracts + newOwnershipContracts * (month - 1)),
    );
    const activeRatio = safeDivide(projectedActiveCars, activeCars || 1);
    const fleetRatio = safeDivide(Math.max(projectedActiveCars, projectedBridgeCarsInUse), activeCars || 1);
    const projectedInstallmentRevenue = projectedInstallmentContracts * financing.monthlyInstallment * financing.retainedInstallmentRate;
    const projectedFinancingCash = projectedInstallmentRevenue + downPaymentCash * ramp;
    const projectedRecurringRevenue = projectedRentalOnlyCars * offer.monthlyPrice * (1 - offer.averageDiscountRate) + projectedInstallmentRevenue;
    const projectedActivationRevenue = activationRevenue * ramp;
    const projectedEntryRevenue = entryRevenue * ramp;
    const projectedComplementaryRevenue = complementaryRevenue * activeRatio;
    const projectedGrossRevenue = projectedRecurringRevenue + projectedActivationRevenue + projectedEntryRevenue + projectedComplementaryRevenue;
    const projectedDeductions = projectedGrossRevenue * taxes.revenueTaxRate;
    const projectedNetRevenue = projectedGrossRevenue - projectedDeductions;
    const projectedDirectCosts = totalFleetCost * fleetRatio + provisions * activeRatio;
    const projectedGrossMargin = projectedNetRevenue - projectedDirectCosts;
    const projectedMarketingCost = marketingCost * (month <= financing.deliveryLeadMonths ? 1 : 0.82);
    const projectedSalesCost = salesCost * Math.max(0.65, ramp);
    const projectedSupportOpsCost = supportOpsCost * Math.max(0.55, activeRatio);
    const projectedAdminCost = adminCost;
    const projectedEbitda = projectedGrossMargin - projectedMarketingCost - projectedSalesCost - projectedSupportOpsCost - projectedAdminCost;
    const projectedProfitTax = Math.max(0, projectedEbitda * taxes.profitTaxRate);
    const projectedNetProfit = projectedEbitda - projectedProfitTax;
    rollingCash += projectedNetProfit;

    return {
      month,
      activeCars: projectedActiveCars,
      rentalOnlyCars: projectedRentalOnlyCars,
      bridgeCarsInUse: projectedBridgeCarsInUse,
      installmentContracts: projectedInstallmentContracts,
      financingCash: projectedFinancingCash,
      grossRevenue: projectedGrossRevenue,
      netRevenue: projectedNetRevenue,
      directCosts: projectedDirectCosts,
      marketingCost: projectedMarketingCost,
      salesCost: projectedSalesCost,
      supportOpsCost: projectedSupportOpsCost,
      adminCost: projectedAdminCost,
      ebitda: projectedEbitda,
      netProfit: projectedNetProfit,
      cashAfterMonth: rollingCash,
    };
  });

  const alerts: string[] = [];
  if (offer.monthlyPrice <= perCarFixedCost) alerts.push("Preco mensal menor ou igual ao custo fixo por carro.");
  if (fleet.downtimeRate > 0.12) alerts.push("Carros parados acima de 12% pressionam caixa e reputacao.");
  if (offer.defaultRate > 0.08) alerts.push("Inadimplencia alta: reforcar KYC, cobranca preventiva e recuperacao.");
  if (cacTotal > ltv && ltv > 0) alerts.push("CAC total maior que LTV: funil ou margem precisam ser corrigidos.");
  if (activatedContracts < fleet.totalCars * 0.25) alerts.push("Geracao de contratos abaixo do necessario para ocupar a frota rapidamente.");
  if (ebitda < 0) alerts.push("EBITDA negativo no mes simulado.");
  if (credit.entrySignalClientRate > 0 && credit.averageEntrySignal > 0) alerts.push("Entrada/sinal exige regra contratual, segregacao e validacao juridica.");
  if (fleet.monthlyKmPerDriver > 3000) alerts.push("Uso acima de 3.000 km/mes pode exigir contrato PJ ou pacote especifico com locadora.");
  if (extraKmCost > 0) alerts.push("Km excedente gerando custo adicional com locadora: validar franquia, grupo tarifario e contrato antes de fechar preco.");
  if (newOwnershipContracts < safeDivide(financing.cohortSize, financing.cohortCadenceMonths) * 0.8) alerts.push("Esteira de posse abaixo do alvo: faltam aprovados para lancar 100 carros a cada ciclo.");
  if (financing.retainedDownPaymentRate > 0.2) alerts.push("Entrada de financiamento deve ser validada com advogado, contador e parceiro regulado antes de reconhecer como receita.");
  if (financing.retainedInstallmentRate > 0.2) alerts.push("Parcela de financiamento recebida pela Libert Drive precisa de estrutura regulada, contrato claro e conciliacao separada.");

  return {
    fleet: {
      activeCars,
      inactiveCars,
      totalFleetCost,
      averageCostPerCar: safeDivide(totalFleetCost, fleet.totalCars),
      lostRevenueFromDowntime,
      monthlyEnergySavingsForDrivers,
      incidentProvision,
      extraKmPerDriver,
      extraKmCost,
    },
    funnel: {
      leads,
      whatsapp,
      webinar,
      applications,
      approved,
      contracts,
      activatedContracts,
      requiredMediaToFillFleet,
      cacMarketing,
      roas,
    },
    financing: {
      newOwnershipContracts,
      bridgeCarsInUse,
      rentalOnlyCars,
      deliveredInstallmentContracts,
      installmentContracts,
      averageDownPayment,
      downPaymentCash,
      installmentRevenue,
      cycleDownPaymentCash,
      annualOwnershipDeliveries,
      releasedCarsPerCycle,
    },
    team: {
      sdrs,
      closers,
      supportAgents,
      fleetManagers,
      operators,
      creditAnalysts,
      salesCost,
      supportOpsCost,
    },
    dre: {
      recurringRevenue,
      activationRevenue,
      entryRevenue,
      complementaryRevenue,
      grossRevenue,
      deductions,
      netRevenue,
      directCosts,
      grossMargin,
      marketingCost,
      salesCost,
      supportOpsCost,
      adminCost,
      provisions,
      ebitda,
      profitTax,
      netProfit,
      cashNeed,
      cashAfterMonth,
    },
    unit: {
      revenuePerActiveCar,
      contributionPerCar,
      breakEvenCars,
      ltv,
      cacTotal,
      ltvCac,
      paybackMonths,
      ebitdaMargin,
    },
    projection,
    alerts,
  };
}

export function flattenResultsForCsv(input: CalculatorAssumptions, result: CalculatorResults) {
  return [
    ["cenario", input.scenario],
    ["carros_total", input.fleet.totalCars],
    ["carros_ativos", result.fleet.activeCars],
    ["horas_por_dia", input.fleet.driverHoursPerDay],
    ["km_mes_motorista", input.fleet.monthlyKmPerDriver],
    ["franquia_km_mes", input.fleet.monthlyKmAllowance],
    ["valor_km_excedente", input.fleet.extraKmFee],
    ["km_excedente_por_motorista", result.fleet.extraKmPerDriver],
    ["custo_km_excedente", result.fleet.extraKmCost],
    ["receita_bruta", result.dre.grossRevenue],
    ["receita_liquida", result.dre.netRevenue],
    ["custo_frota", result.fleet.totalFleetCost],
    ["margem_bruta", result.dre.grossMargin],
    ["ebitda", result.dre.ebitda],
    ["lucro_liquido", result.dre.netProfit],
    ["leads", result.funnel.leads],
    ["contratos_ativados", result.funnel.activatedContracts],
    ["cac_total", result.unit.cacTotal],
    ["ltv", result.unit.ltv],
    ["ltv_cac", result.unit.ltvCac],
    ["break_even_carros", result.unit.breakEvenCars ?? "sem margem positiva"],
    ["novos_contratos_posse", result.financing.newOwnershipContracts],
    ["carros_ponte_em_uso", result.financing.bridgeCarsInUse],
    ["entrada_financiamento_caixa", result.financing.downPaymentCash],
    ["parcelas_financiamento_mes", result.financing.installmentRevenue],
    ["entregas_posse_ano", result.financing.annualOwnershipDeliveries],
    ...result.projection.flatMap((month) => [
      [`mes_${month.month}_receita_bruta`, month.grossRevenue],
      [`mes_${month.month}_caixa_financiamento`, month.financingCash],
      [`mes_${month.month}_custos_diretos`, month.directCosts],
      [`mes_${month.month}_ebitda`, month.ebitda],
      [`mes_${month.month}_lucro_liquido`, month.netProfit],
      [`mes_${month.month}_caixa_final`, month.cashAfterMonth],
    ]),
  ];
}
