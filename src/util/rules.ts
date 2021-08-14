const rules = {
  monitorInterval: {
    init: 2,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined) =>
      value !== undefined &&
      !isNaN(+value) &&
      rules.monitorInterval.min <= +value &&
      +value <= rules.monitorInterval.max
  },
  clearInterval: {
    init: 60,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined) =>
      value !== undefined &&
      !isNaN(+value) &&
      rules.clearInterval.min <= +value &&
      +value <= rules.clearInterval.max
  },
  maxHistoryCount: {
    init: 100,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    rule: (value: string | number | undefined) =>
      value !== undefined &&
      !isNaN(+value) &&
      rules.maxHistoryCount.min <= +value &&
      +value <= rules.maxHistoryCount.max
  },
  commandTimeout: {
    init: 200,
    min: 0,
    max: Math.pow(2, 32) / 2 - 1,
    rule: (value: string | number | undefined) =>
      value !== undefined &&
      !isNaN(+value) &&
      rules.commandTimeout.min <= +value &&
      +value <= rules.commandTimeout.max
  }
};

export default rules;
