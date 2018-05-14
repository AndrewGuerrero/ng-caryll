import { Injectable } from '@angular/core';

export interface DocItem {
  id: string;
  name: string;
}

const DOCS: DocItem[] = [
  {
    id: 'tao_of_microservices',
    name: 'The Tao of Microservices',
  },
  {
    id: 'building_evolutionary_architectures',
    name: 'Building Evolutionary Architectures',
  },
];

@Injectable()
export class DocumentationItemsService {
  getAllItems(): DocItem[] {
    return DOCS;
  }

  getItemById(id: string): DocItem {
    return DOCS.find(i => i.id === id);
  }
}