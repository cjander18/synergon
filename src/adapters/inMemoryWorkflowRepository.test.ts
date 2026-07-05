import { workflowRepositoryContract } from './workflowRepositoryContract';
import { InMemoryWorkflowRepository } from './inMemoryWorkflowRepository';

workflowRepositoryContract('InMemoryWorkflowRepository', () => new InMemoryWorkflowRepository());
