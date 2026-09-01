import { useCallback, useEffect, useRef, useState } from "react";
import infoApi from "../services/infoApi";

const MENU_ENDPOINTS = [
  { key: "education",     path: "/educations"  },
  { key: "work_history",  path: "/workexes"    },
  { key: "admin_history", path: "/boardexes"   },
  { key: "expertise",     path: "/expertises"  },
  { key: "interest",      path: "/interests"   },
  { key: "research",      path: "/researches"  },
  { key: "journal",       path: "/journals"    },
  { key: "proceeding",    path: "/proceedings" },
  { key: "book",          path: "/books"       },
  { key: "patent",        path: "/patents"     },
  { key: "award",         path: "/awards"      },
  { key: "speaker",       path: "/lecturers"   },
  { key: "training",      path: "/trainings"   },
  { key: "service",       path: "/academics"   },
  { key: "human_subjects",path: "/hsps"        },
];

const extractCount = (responseData) => {
  const data = responseData?.data ?? responseData ?? [];
  if (Array.isArray(data)) return data.length;
  if (typeof data === "object") {
    return data.total ?? data.count ?? data.length ?? 0;
  }
  return 0;
};

const useMenuCounts = () => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refetch = useCallback(async () => {
    if (mounted.current) setLoading(true);
    const results = await Promise.allSettled(
      MENU_ENDPOINTS.map((e) => infoApi.get(`/info/expert${e.path}`))
    );
    const newCounts = {};
    results.forEach((result, i) => {
      const key = MENU_ENDPOINTS[i].key;
      if (result.status === "fulfilled") {
        newCounts[key] = extractCount(result.value.data);
      } else {
        newCounts[key] = null;
        if (__DEV__) {
          const error = result.reason;
          console.warn(
            `[useMenuCounts] ${MENU_ENDPOINTS[i].path} failed:`,
            error?.response?.status ?? error?.code ?? "NETWORK_ERROR",
            error?.response?.data?.message ?? error?.message,
          );
        }
      }
    });
    if (mounted.current) {
      setCounts(newCounts);
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { counts, loading, refetch };
};

export default useMenuCounts;
