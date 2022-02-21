import React from 'react';
import FlowList from './../components/FlowList';
import sizeMe from 'react-sizeme';
import InstanceCard from './InstanceCard';

function InstancePane(props) { 
  return (
    <div
      id="InstancePane"
      style={{
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
      }}
    >
      <FlowList>
        <InstanceCard
          running={true}
          name={'PowerMeter A12'}
          application={'python/mm5'}
        />
        <InstanceCard
          running={false}
          name={'MultiMeter A55 测试'}
          application={'scala/TDC_Parser'}
        />
      </FlowList>
    </div>
  );
}

export default sizeMe()(InstancePane);
