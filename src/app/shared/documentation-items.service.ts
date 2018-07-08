import { Injectable } from '@angular/core';

export interface DocItem {
  id: string;
  name: string;
  theme: string;
}

const DOCS: DocItem[] = [
  {
    id: 'building_evolutionary_architectures',
    name: 'Building Evolutionary Architectures',
    theme: 'purple',
  },
  {
    id: 'tao_of_microservices',
    name: 'The Tao of Microservices',
    theme: 'green',
  },
  //{
  //  id: 'guide_to_writing_testable_code',
  //  name: 'Guide to Writing Testable Code',
  //  theme: 'blue',
  //},
  {
    id: 'effective_cpp',
    name: 'Effective C++',
    theme: 'red',
  },
  {
    id: 'more_effective_cpp',
    name: 'More Effective C++',
    theme: 'orange',
  },
  {
    id: 'effective_stl',
    name: 'Effective STL',
    theme: 'yellow',
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