import React from 'react';
import { Card, Col, Row, message } from 'antd';
import  './gitBranchCardList.css';

type Props = {
  branchNames: string[];
};

const GitBranchCardList: React.FC<Props> = ({ branchNames }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Copied: ${text}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Generated Branch Names:</h2>
      <Row gutter={[16, 16]}>
        {branchNames.slice(1, branchNames.length - 1).map((name, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleCopy(name)}
              className="custom-card"
              bodyStyle={{ padding: '16px' }}
            >
              {name}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GitBranchCardList;
