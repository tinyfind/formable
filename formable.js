
    // 工具
    function getDataType(data) {
      return Object.prototype.toString
        .call(data)
        .replaceAll(/[\[|\]]/g, "")
        .split(" ")[1]
        .toLowerCase();
    }

    const UNIQUE = {
      WATCH: Symbol("watch"),
      COMPUTE: Symbol("compute"),
    };
    Object.freeze(UNIQUE);

    //
    export function watch(getter) {
      return {
        $$typeof: UNIQUE.WATCH,
        getter,
      };
    }
    //
    export function compute(getter, deps) {
      return {
        $$typeof: UNIQUE.COMPUTE,
        getter,
        deps,
      };
    }
    // 判断 是否是 操作数据结构
    function isOperateStruct(schema) {
      return (
        getDataType(schema) === "object" &&
        Object.values(UNIQUE).includes(schema.$$typeof)
      );
    }

    function getDepend(schema) {
      const computes = {};
      const watchs = {};
      for (let prop in schema) {
        // 只暴露 COMPUTE 或者 WATCH
        if (schema[prop]["$$typeof"] === UNIQUE.COMPUTE) {
          schema[prop].deps.forEach((depKey) => {
            computes[depKey] = computes[depKey] || {};
            computes[depKey][prop] = schema[prop].getter;
          });
        } else if (schema[prop]["$$typeof"] == UNIQUE.WATCH) {
          watchs[prop] = schema[prop];
        }
      }
      return {
        computes,
        watchs,
      };
    }

    //
    function getConfig(schema) {
      const { computes, watchs } = getDepend(schema);
      config = {
        get(target, prop, self) {
          if (Object.keys(watchs).includes(prop)) {
            return watchs[prop].getter(self);
          }
          return target[prop];
        },
        set(target, prop, value, self) {
          if (Object.keys(watchs).includes(prop)) return;
          target[prop] = value;
          Object.keys(computes[prop] || {})?.forEach((item) => {
            self[item] = computes[prop][item](self);
          });
          return true;
        },
      };
      return config;
    }

    function proxyData(data, schema) {
      if (getDataType(schema) === "object") {
        // 表示对应数据为对象 或者 数组 index结构
        for (let key in schema) {
          // 为 object 表示 是对象结构 继续解析
          if (!isOperateStruct(schema[key])) {
            data[key] = proxyData(data[key], schema[key]);
          }
          // 为 array 表示 是数组结构 继续遍历解析
        }
        if (["object","array"].includes(getDataType(data))) {
          return new Proxy(data, getConfig(schema));
        }
      }

      if (getDataType(schema) === "array") {
        // 表示对应数据为数组
        // 首项应为配置项
        for (let index in data) {
          if (!isOperateStruct(schema[0])) {
            data[index] = proxyData(data[index], schema[0]);
          }
        }
        // 配置config
        if (["object","array"].includes(getDataType(data))) {
          return new Proxy(data, {
            set(target, prop, value, self) {
              target[prop] = proxyData(value, schema[0]);
              return true
            },
          });
        }
      }

      return data;
    }

    export default function useFormable(data, schema) {
      return proxyData(data, schema);
    }

    const schemaArr = [
      {
        hobbyNum: watch(($) => $.hobbyList.length),
        hobbyList: [
          {
            timeStr: watch(($) => `Time:${$.time}`),
          },
        ],
        jobs:{
          merge:watch($=>Object.keys($).join(','))
        }
      },
    ];
    const formData = useForm(
      [
        {
          name: "董",
          hobbyList: [
            { name: "swim", time: 12 },
            { name: "basketball", time: 10 },
          ],
          jobs: { first: "game", second: "computer" },
        },
      ],
      schemaArr
    );
    formData[0].hobbyList.push({ name: "?", time: 8 });

