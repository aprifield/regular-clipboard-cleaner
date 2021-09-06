const rules = {
  monitorInterval: {
    init: 1,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined) =>
      rules.monitorInterval.min <= Number(value) &&
      Number(value) <= rules.monitorInterval.max
  },
  clearInterval: {
    init: 60,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined) =>
      rules.clearInterval.min <= Number(value) &&
      Number(value) <= rules.clearInterval.max
  },
  maxHistoryCount: {
    init: 100,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    rule: (value: string | number | undefined) =>
      rules.maxHistoryCount.min <= Number(value) &&
      Number(value) <= rules.maxHistoryCount.max
  },
  pasteAfterCopyTimeout: {
    init: 200,
    min: 0,
    max: Math.pow(2, 32) / 2 - 1,
    rule: (value: string | number | undefined) =>
      rules.pasteAfterCopyTimeout.min <= Number(value) &&
      Number(value) <= rules.pasteAfterCopyTimeout.max
  },
  commandAfterCopyTimeout: {
    init: 200,
    min: 0,
    max: Math.pow(2, 32) / 2 - 1,
    rule: (value: string | number | undefined) =>
      rules.commandAfterCopyTimeout.min <= Number(value) &&
      Number(value) <= rules.commandAfterCopyTimeout.max
  }
};

export default rules;
