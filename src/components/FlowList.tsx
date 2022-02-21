import React from 'react';
import sizeMe from 'react-sizeme';
import './FlowList.global.css';

class FlowList extends React.Component {
  constructor(props) {
    super(props);
    this.children = props.children;
  }

  render() {
    const children = [];
    const propChildren = Array.isArray(this.children)
      ? this.children
      : [this.children];
    for (const c in propChildren) {
      children.push(<div key={'C' + c}>{propChildren[c]}</div>);
      children.push(<div key={'B' + c} className={'separateBar'}></div>);
    }
    return <div>{children}</div>;
  }
}

export default sizeMe({ monitorHeight: true })(FlowList);
