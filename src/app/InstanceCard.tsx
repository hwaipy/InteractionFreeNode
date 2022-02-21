import React from 'react';
import sizeMe from 'react-sizeme';
import './InstanceCard.global.css';
import { BsLayersFill, BsLayers } from 'react-icons/bs';

class InstanceCard extends React.Component {
  constructor(props) {
    super(props);
    this.height = props.height;
    this.language = props.language;
    this.size = props.size;
  }

  render() {
    return (
      <div className={'applicationCard'}>
        {this.props.running ? (
          <BsLayersFill size={24} className={'languageLogoOn'} />
        ) : (
          <BsLayers size={24} className={'languageLogoOff'} />
        )}
        <div className={'titlePrimary'}>
          <span>{this.props.name}</span>
          <span>&nbsp;&nbsp;&nbsp;</span>
          <span className={'titleApplication'}>{this.props.application}</span>
        </div>
        <div className={'titleSecondary'}>
          {this.props.running ? 'Running' : 'Stopped'}
        </div>
      </div>
    );
  }
}

InstanceCard.defaultProps = {
  language: 'Default',
};

export default sizeMe({ monitorHeight: true })(InstanceCard);
