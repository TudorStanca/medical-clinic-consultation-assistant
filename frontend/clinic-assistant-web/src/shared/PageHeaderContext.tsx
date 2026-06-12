import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface PageHeaderState {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
}

interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (h: PageHeaderState) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  header: { title: "" },
  setHeader: () => {},
});

export const usePageHeader = () => useContext(PageHeaderContext);

export const PageHeaderProvider = ({ children }: { children: ReactNode }) => {
  const [header, setHeader] = useState<PageHeaderState>({ title: "" });

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export default PageHeaderContext;
