import './App.css';
import { useState } from 'react';
import GitBranchCardList from './components/gitBranchCardList/gitBranchCardList';
import generateBranchNames from './api/api.tsx';
import { message, Tooltip, Spin } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import jiraGitLogo from './assets/jiraGitLogo.png';


function App() {
  const [branchNames, setBranchNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);  

  const getJiraIssueDetails = async () => {
    setLoading(true);  
    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('Tab ID is undefined');
      }

      const url = new URL(tab.url || '');
      const isAtlassianJiraPage = url.hostname.endsWith('atlassian.net');

      if (!isAtlassianJiraPage) {
        message.warning(`Please ensure you're on the Atlassian Jira site.`);
        setLoading(false);  
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const jiraIdElement = document.querySelector('a[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"] span.css-1gd7hga');
            const jiraDescriptionElement = document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]');
      
            if (jiraIdElement && jiraDescriptionElement) {
              const jiraId = jiraIdElement.textContent?.trim() ?? (jiraIdElement as HTMLElement).innerText?.trim() ?? '';
              const jiraDescription = jiraDescriptionElement.textContent?.trim() ?? (jiraDescriptionElement as HTMLElement).innerText?.trim() ?? '';
                    
              return { jiraId, jiraDescription };
            } else {
              console.error("Jira ID or Jira Description not found!");
              return null;
            }
          },
        },
        async (injectionResults) => {
          if (!injectionResults || injectionResults.length === 0 || !injectionResults[0].result) {
            message.warning(`Could not retrieve Jira details.`);
            setLoading(false);
            return;
          }
      
          const { jiraId, jiraDescription } = injectionResults[0].result;
      
          try {
            const branchNamesArray = await generateBranchNames(jiraId, jiraDescription);
            setBranchNames(branchNamesArray);
      
            if (branchNamesArray.length === 0) {
              message.warning(`No branch names generated. Please check your Jira issue.`);
            }
          } catch (error) {
            console.error("Error generating branch names:", error);
            message.error(`Failed to generate branch names.`);
          }
      
          setLoading(false);
        }
      );

    } catch (error) {
      message.error("Error fetching branch name");
      setLoading(false); 
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={jiraGitLogo} alt="Jira and Github Image" style={{ width: '75px', height: '100px', marginBottom: '20px' }} />
        <button onClick={getJiraIssueDetails}>Get feature branch names for this issue</button>
        <br />
      </div>

      <div>
        {loading ? (
          <Spin tip="Loading branch names..." />  
        ) : branchNames.length > 0 ? (
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
