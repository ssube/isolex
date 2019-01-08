export const QUERY_PR_CLOSE = `
  mutation merge ($requestID: ID!) {
    closePullRequest(input: {
      pullRequestId: $requestID
    }) {
      pullRequest {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

export const QUERY_PR_GET = `
  query ($owner: String!, $project: String!, $requestNumber: Int!) {
    repository(owner: $owner, name: $project) {
      pullRequest(number: $requestNumber) {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

export const QUERY_PR_LIST = `
  query ($owner: String!, $project: String!) {
    repository(owner: $owner, name: $project) {
      pullRequests(first: 10, states: [OPEN]) {
        nodes {
          author {
            login
          }
          id
          number
          title
        }
      }
    }
  }
`;

export const QUERY_PR_MERGE = `
  mutation merge ($requestID: ID!, $message: String!) {
    mergePullRequest(input: {
      commitBody: ""
      commitHeadline: $message
      pullRequestId: $requestID
    }) {
      pullRequest {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

export interface GithubGetResponse {
  repository: {
    pullRequest: {
      author: {
        login: string;
      };
      id: string;
      number: number;
      title: string;
    };
  };
}

