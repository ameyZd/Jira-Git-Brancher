import './App.css';
import { useState } from 'react';
import GitBranchCardList from './components/gitBranchCardList/gitBranchCardList';
import generateBranchNames from './api/api.tsx';
import { message, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

function App() {
  const [branchNames, setBranchNames] = useState<string[]>([]);

  const getJiraIssueDetails = async () => {
    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('Tab ID is undefined');
      }

      const url = new URL(tab.url || '');
      const isAtlassianJiraPage = url.hostname.endsWith('atlassian.net');

      if (!isAtlassianJiraPage) {
        message.warning(`Please ensure you're on the Atlassian Jira site.`);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const jiraIdElements = document.getElementsByClassName("_6v24qk37 _9jddv77o css-1k1n5w1");
          const jiraDescriptionElements = document.getElementsByClassName("_1wyb1tcg _vwz41f4h _k48pbfng _1dyzz5jk _1bsb1osq _19pkidpf _2hwxidpf _otyridpf _18u0idpf _ca0qidpf _u5f3idpf _n3tdidpf _19bvidpf _syaz1fxt _osi5fg65 _mc2h1hna _14fy1hna");

          if (jiraIdElements.length > 0 && jiraDescriptionElements.length > 0) {
            const jiraId = (jiraIdElements[2] as HTMLElement).textContent || (jiraIdElements[2] as HTMLElement).innerText;
            const jiraDescription = (jiraDescriptionElements[0] as HTMLElement).textContent || (jiraDescriptionElements[0] as HTMLElement).innerText;
            return { jiraId, jiraDescription };
          } else {
            return null;
          }
        }
      }, async (injectionResults) => {
        const [result] = injectionResults;
        if (result && result.result) {
          const { jiraId, jiraDescription } = result.result;
          const branchNamesArray = await generateBranchNames(jiraId, jiraDescription);
          setBranchNames(branchNamesArray);
          if (branchNamesArray.length == 0) {
            message.warning(`Please ensure you're on the Atlassian Jira site.`);
          }

        } else {
          message.warning(`Please ensure you're on the Atlassian Jira site.`);
        }
      });

    } catch (error) {
      message.error("Error fetching branch name");
    }
  };

  return (
    <div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="https://i.ibb.co/8MXQ2GL/jira-XGhub.png" alt="Jira and Github Image" style={{ width: '75px', height: '100px', marginBottom: '20px' }} />

        <button onClick={getJiraIssueDetails}>Get feature branch names for this issue</button>
        <br />

      </div>

      <div>
        {branchNames.length > 0 ? (
          <>

            <GitBranchCardList branchNames={branchNames} />
            <Tooltip
              title="If you're not satisfied with the response, please click the button again."
              placement="bottom"
              overlayStyle={{ fontSize: '12px', maxWidth: '200px' }}
            >
              <InfoCircleOutlined style={{ fontSize: '16px', color: '#1890ff', marginLeft: '8px' }} />
            </Tooltip>
          </>

        ) : null}
      </div>
    </div>
  );
}

export default App;
