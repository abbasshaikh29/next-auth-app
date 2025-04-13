import "react";

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
