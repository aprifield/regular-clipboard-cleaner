const rules = {
  monitorInterval: {
    init: 1,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.monitorInterval;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.monitorInterval;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  },
  clearInterval: {
    init: 60,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.clearInterval;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.clearInterval;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  },
  maxHistoryCount: {
    init: 100,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.maxHistoryCount;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.maxHistoryCount;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  },
  maxTextLength: {
    init: 100000,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.maxTextLength;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.maxTextLength;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  },
  pasteAfterCopyTimeout: {
    init: 200,
    min: 0,
    max: Math.pow(2, 32) / 2 - 1,
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.pasteAfterCopyTimeout;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.pasteAfterCopyTimeout;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  },
  commandAfterCopyTimeout: {
    init: 200,
    min: 0,
    max: Math.pow(2, 32) / 2 - 1,
    rule: (value: string | number | undefined): boolean => {
      const obj = rules.commandAfterCopyTimeout;
      return obj.min <= Number(value) && Number(value) <= obj.max;
    },
    value: (value: string | number | undefined): number => {
      const obj = rules.commandAfterCopyTimeout;
      return obj.rule(value) ? Number(value) : obj.init;
    }
  }
};

export default rules;
