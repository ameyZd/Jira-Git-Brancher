import './App.css';
import { useState } from 'react';
import GitBranchCardList from './components/gitBranchCardList/gitBranchCardList';
import generateBranchNames from './api/api.tsx';
import { message } from 'antd';

function App() {
  const [branchNames, setBranchNames] = useState<string[]>([]); // State to store branch names

  const getJiraIssueDetails = async () => {
    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('Tab ID is undefined');
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

        } else {
          message.warning(`Please ensure you're on the Atlassian Jira site.`);
        }
      });

    } catch (error) {
      message.error("Error fetching branch name:");
    }
  };

  return (
    <div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="https://i.ibb.co/8MXQ2GL/jira-XGhub.png" alt="Jira and Github Image" style={{ width: '75px', height: '100px', marginBottom: '20px' }} />

        <button onClick={getJiraIssueDetails}>Get feature branch names for this issue</button>
      </div>

      <div>
        {branchNames.length > 0 ? (
          <GitBranchCardList branchNames={branchNames} />
        ) : null}
      </div>
    </div>
  );
}

export default App;
