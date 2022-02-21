import React from 'react';
import './GTab.global.css';
import sizeMe from 'react-sizeme';

class GTab extends React.Component {
  constructor(props) {
    super(props);
    this.propsChildren = props.children
      ? Array.isArray(props.children)
        ? props.children
        : [props.children]
      : [];
    this.navWidth = props.navWidth ? props.navWidth : 64;

    this.labels = [];
    this.labelSelection = 0;
    this.contents = [];
    this.gTabContentGroup = new GTabContentGroup();
    for (let i = 0; i < this.props.children.length; i++) {
      this.contents.push(
        <GTabContent
          navWidth={this.navWidth}
          group={this.gTabContentGroup}
          hide={this.labelSelection != i}
          key={'KeyGTabContent_' + i}
        >
          {this.props.children[i].props.content}
        </GTabContent>
      );
    }
  }

  onLabelSelection(id) {
    this.labelSelection = id;
    this.gTabContentGroup.setVisible(this.labelSelection);
    this.setState({});
  }

  render() {
    const labels = [];
    let labelKeyNum = 0;
    for (let i = 0; i < this.props.children.length; i++) {
      labels.push(
        <GTabLabel
          icon={this.props.children[i].props.icon}
          size={this.navWidth}
          labelID={i}
          onAction={(id) => this.onLabelSelection(id)}
          key={'KeyGTabLabel_' + i}
          selected={this.labelSelection == i}
        />
      );
    }
    return (
      <div className={'root'}>
        <div
          className={'labelBar'}
          style={{ width: this.navWidth + 'px' }}
        >
          {labels}
        </div>
        <div
          style={{
            position: 'fixed',
            left: this.navWidth + 'px',
            width: this.props.size.width - this.navWidth,
            top: 0,
            height: this.props.size.height,
          }}
          className={'labelContent'}
        >
          {this.contents}
        </div>
      </div>
    );
  }
}

function GTabLabel(props) {
  return (
    <button
      className={props.selected ? 'selected' : ''}
      style={{
        height: props.size,
        width: props.size,
      }}
      onClick={() => props.onAction(props.labelID)}
    >
      <div>{props.icon}</div>
    </button>
  );
}

class GTabContent extends React.Component {
  constructor(props) {
    super(props);
    this.group = props.group;
    this.group.register(this);
    this.visible = !this.props.hide;
  }

  setVisible(visible) {
    this.visible = visible;
    this.setState({});
  }

  render() {
    return (
      <div
        className={'gtabContent'}
        style={{ visibility: this.visible ? 'visible' : 'hidden' }}
      >
        {this.props.children}
      </div>
    );
  }
}

class GTabContentGroup {
  constructor() {
    this.members = [];
  }

  register(content) {
    this.members.push(content);
  }

  setVisible(selection) {
    for (let i = 0; i < this.members.length; i++) {
      this.members[i].setVisible(selection == i);
    }
  }
}

export default sizeMe({ monitorHeight: true })(GTab);