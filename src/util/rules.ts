const rules = {
  monitorInterval: {
    init: 1,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    value: (value: string | number | undefined): number => {
      const obj = rules.monitorInterval;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  clearInterval: {
    init: 60,
    min: 1,
    max: Math.floor((Math.pow(2, 32) / 2 - 1) / 1000),
    value: (value: string | number | undefined): number => {
      const obj = rules.clearInterval;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  maxHistoryCount: {
    init: 100,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    value: (value: string | number | undefined): number => {
      const obj = rules.maxHistoryCount;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  maxTextLength: {
    init: 100_000,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    value: (value: string | number | undefined): number => {
      const obj = rules.maxTextLength;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  retentionPeriod: {
    init: 60 * 24 * 7,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    value: (value: string | number | undefined): number => {
      const obj = rules.retentionPeriod;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  pasteAfterCopyTimeout: {
    init: 300,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    value: (value: string | number | undefined): number => {
      const obj = rules.pasteAfterCopyTimeout;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
  commandAfterCopyTimeout: {
    init: 300,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    value: (value: string | number | undefined): number => {
      const obj = rules.commandAfterCopyTimeout;
      const num = Number(value);
      return obj.min <= num && num <= obj.max ? num : obj.init;
    },
  },
};

export default rules;
