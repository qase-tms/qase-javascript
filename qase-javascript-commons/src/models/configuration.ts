export interface ConfigurationGroup {
  id: number;
  title: string;
  configurations: ConfigurationItem[];
}

export interface ConfigurationItem {
  id: number;
  title: string;
}

export interface ConfigurationGroupResponse {
  groups: ConfigurationGroup[];
} 
