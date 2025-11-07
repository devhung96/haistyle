
export interface Hairstyle {
  name: string;
  description: string;
  reason: string;
  imageUrl?: string;
}

export interface Preferences {
  length: 'short' | 'medium' | 'long' | 'any';
  style: 'straight' | 'wavy' | 'curly' | 'coily' | 'any';
  vibe: string;
}
