/* eslint-disable */
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { WebsiteSelectModel, PageSelectModel, CommentSelectModel } from '$lib/server/db/schema';
import type { Context } from '$lib/graphql/server/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  URL: { input: URL; output: URL; }
};

export enum CachePolicy {
  CacheAndNetwork = 'CacheAndNetwork',
  CacheOnly = 'CacheOnly',
  CacheOrNetwork = 'CacheOrNetwork',
  NetworkOnly = 'NetworkOnly',
  NoCache = 'NoCache'
}

export type Comment = Node & {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  page: Page;
  published: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website: Website;
};

export type CommentEdge = Edge & {
  __typename?: 'CommentEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node: Comment;
};

export type CommentsConnection = Connection & {
  __typename?: 'CommentsConnection';
  edges: Array<CommentEdge>;
  pageInfo: PageInfo;
};

export type Connection = {
  edges: Array<Edge>;
  pageInfo: PageInfo;
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  pageId: Scalars['ID']['input'];
};

export enum DedupeMatchMode {
  None = 'None',
  Operation = 'Operation',
  Variables = 'Variables'
}

export type DeleteCommentInput = {
  commentId: Scalars['ID']['input'];
};

export type Edge = {
  cursor?: Maybe<Scalars['String']['output']>;
  node: Node;
};

export type Mutation = {
  __typename?: 'Mutation';
  createComment: Comment;
  deleteComment: Comment;
  publishComment: Comment;
  updateCommentContent: Comment;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationPublishCommentArgs = {
  input: PublishCommentInput;
};


export type MutationUpdateCommentContentArgs = {
  input: UpdateCommentContentInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type Page = Node & {
  __typename?: 'Page';
  closed: Scalars['Boolean']['output'];
  comments: CommentsConnection;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  preModeration: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  url?: Maybe<Scalars['URL']['output']>;
  website: Website;
};


export type PageCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PageInput = {
  overrides?: InputMaybe<PageOverrides>;
  slug: Scalars['String']['input'];
};

export type PageOverrides = {
  name: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};

/** The Component scalar is only defined if the user has any component fields */
export enum PaginateMode {
  Infinite = 'Infinite',
  SinglePage = 'SinglePage'
}

export type PublishCommentInput = {
  commentId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  website?: Maybe<Website>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebsiteArgs = {
  id: Scalars['Int']['input'];
};

export type UpdateCommentContentInput = {
  commentId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
};

export type User = Node & {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type Website = Node & {
  __typename?: 'Website';
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: User;
  page: Page;
  preModeration: Scalars['Boolean']['output'];
};


export type WebsitePageArgs = {
  input: PageInput;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Connection: ( Omit<CommentsConnection, 'edges'> & { edges: Array<_RefType['CommentEdge']> } );
  Edge: ( Omit<CommentEdge, 'node'> & { node: _RefType['Comment'] } );
  Node: ( CommentSelectModel ) | ( PageSelectModel ) | ( User ) | ( WebsiteSelectModel );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CachePolicy: CachePolicy;
  Comment: ResolverTypeWrapper<CommentSelectModel>;
  CommentEdge: ResolverTypeWrapper<Omit<CommentEdge, 'node'> & { node: ResolversTypes['Comment'] }>;
  CommentsConnection: ResolverTypeWrapper<Omit<CommentsConnection, 'edges'> & { edges: Array<ResolversTypes['CommentEdge']> }>;
  Connection: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Connection']>;
  CreateCommentInput: CreateCommentInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DedupeMatchMode: DedupeMatchMode;
  DeleteCommentInput: DeleteCommentInput;
  Edge: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Edge']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  Page: ResolverTypeWrapper<PageSelectModel>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PageInput: PageInput;
  PageOverrides: PageOverrides;
  PaginateMode: PaginateMode;
  PublishCommentInput: PublishCommentInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UpdateCommentContentInput: UpdateCommentContentInput;
  User: ResolverTypeWrapper<User>;
  Website: ResolverTypeWrapper<WebsiteSelectModel>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Comment: CommentSelectModel;
  CommentEdge: Omit<CommentEdge, 'node'> & { node: ResolversParentTypes['Comment'] };
  CommentsConnection: Omit<CommentsConnection, 'edges'> & { edges: Array<ResolversParentTypes['CommentEdge']> };
  Connection: ResolversInterfaceTypes<ResolversParentTypes>['Connection'];
  CreateCommentInput: CreateCommentInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteCommentInput: DeleteCommentInput;
  Edge: ResolversInterfaceTypes<ResolversParentTypes>['Edge'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  Page: PageSelectModel;
  PageInfo: PageInfo;
  PageInput: PageInput;
  PageOverrides: PageOverrides;
  PublishCommentInput: PublishCommentInput;
  Query: {};
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
  UpdateCommentContentInput: UpdateCommentContentInput;
  User: User;
  Website: WebsiteSelectModel;
};

export type AllListsDirectiveArgs = { };

export type AllListsDirectiveResolver<Result, Parent, ContextType = Context, Args = AllListsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AppendDirectiveArgs = { };

export type AppendDirectiveResolver<Result, Parent, ContextType = Context, Args = AppendDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ArgumentsDirectiveArgs = { };

export type ArgumentsDirectiveResolver<Result, Parent, ContextType = Context, Args = ArgumentsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BlockingDirectiveArgs = { };

export type BlockingDirectiveResolver<Result, Parent, ContextType = Context, Args = BlockingDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Blocking_DisableDirectiveArgs = { };

export type Blocking_DisableDirectiveResolver<Result, Parent, ContextType = Context, Args = Blocking_DisableDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheDirectiveArgs = {
  partial?: Maybe<Scalars['Boolean']['input']>;
  policy?: Maybe<CachePolicy>;
};

export type CacheDirectiveResolver<Result, Parent, ContextType = Context, Args = CacheDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type DedupeDirectiveArgs = {
  cancelFirst?: Maybe<Scalars['Boolean']['input']>;
  match?: Maybe<DedupeMatchMode>;
};

export type DedupeDirectiveResolver<Result, Parent, ContextType = Context, Args = DedupeDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ListDirectiveArgs = {
  connection?: Maybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type ListDirectiveResolver<Result, Parent, ContextType = Context, Args = ListDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LoadDirectiveArgs = { };

export type LoadDirectiveResolver<Result, Parent, ContextType = Context, Args = LoadDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LoadingDirectiveArgs = {
  cascade?: Maybe<Scalars['Boolean']['input']>;
  count?: Maybe<Scalars['Int']['input']>;
};

export type LoadingDirectiveResolver<Result, Parent, ContextType = Context, Args = LoadingDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Mask_DisableDirectiveArgs = { };

export type Mask_DisableDirectiveResolver<Result, Parent, ContextType = Context, Args = Mask_DisableDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Mask_EnableDirectiveArgs = { };

export type Mask_EnableDirectiveResolver<Result, Parent, ContextType = Context, Args = Mask_EnableDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type OptimisticKeyDirectiveArgs = { };

export type OptimisticKeyDirectiveResolver<Result, Parent, ContextType = Context, Args = OptimisticKeyDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type PaginateDirectiveArgs = {
  mode?: Maybe<PaginateMode>;
  name?: Maybe<Scalars['String']['input']>;
};

export type PaginateDirectiveResolver<Result, Parent, ContextType = Context, Args = PaginateDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ParentIdDirectiveArgs = {
  value: Scalars['ID']['input'];
};

export type ParentIdDirectiveResolver<Result, Parent, ContextType = Context, Args = ParentIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type PrependDirectiveArgs = { };

export type PrependDirectiveResolver<Result, Parent, ContextType = Context, Args = PrependDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type RequiredDirectiveArgs = { };

export type RequiredDirectiveResolver<Result, Parent, ContextType = Context, Args = RequiredDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type WhenDirectiveArgs = { };

export type WhenDirectiveResolver<Result, Parent, ContextType = Context, Args = WhenDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type When_NotDirectiveArgs = { };

export type When_NotDirectiveResolver<Result, Parent, ContextType = Context, Args = When_NotDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type WithDirectiveArgs = { };

export type WithDirectiveResolver<Result, Parent, ContextType = Context, Args = WithDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CommentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Page'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<ResolversTypes['Website'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentEdge'] = ResolversParentTypes['CommentEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentsConnection'] = ResolversParentTypes['CommentsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['CommentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Connection'] = ResolversParentTypes['Connection']> = {
  __resolveType: TypeResolveFn<'CommentsConnection', ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['Edge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Edge'] = ResolversParentTypes['Edge']> = {
  __resolveType: TypeResolveFn<'CommentEdge', ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Node'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input'>>;
  deleteComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'input'>>;
  publishComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationPublishCommentArgs, 'input'>>;
  updateCommentContent?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationUpdateCommentContentArgs, 'input'>>;
};

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'Comment' | 'Page' | 'User' | 'Website', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type PageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']> = {
  closed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  comments?: Resolver<ResolversTypes['CommentsConnection'], ParentType, ContextType, Partial<PageCommentsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preModeration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  website?: Resolver<ResolversTypes['Website'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  website?: Resolver<Maybe<ResolversTypes['Website']>, ParentType, ContextType, RequireFields<QueryWebsiteArgs, 'id'>>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebsiteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Website'] = ResolversParentTypes['Website']> = {
  domains?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Page'], ParentType, ContextType, RequireFields<WebsitePageArgs, 'input'>>;
  preModeration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Comment?: CommentResolvers<ContextType>;
  CommentEdge?: CommentEdgeResolvers<ContextType>;
  CommentsConnection?: CommentsConnectionResolvers<ContextType>;
  Connection?: ConnectionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Edge?: EdgeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Page?: PageResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  URL?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  Website?: WebsiteResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = Context> = {
  allLists?: AllListsDirectiveResolver<any, any, ContextType>;
  append?: AppendDirectiveResolver<any, any, ContextType>;
  arguments?: ArgumentsDirectiveResolver<any, any, ContextType>;
  blocking?: BlockingDirectiveResolver<any, any, ContextType>;
  blocking_disable?: Blocking_DisableDirectiveResolver<any, any, ContextType>;
  cache?: CacheDirectiveResolver<any, any, ContextType>;
  dedupe?: DedupeDirectiveResolver<any, any, ContextType>;
  list?: ListDirectiveResolver<any, any, ContextType>;
  load?: LoadDirectiveResolver<any, any, ContextType>;
  loading?: LoadingDirectiveResolver<any, any, ContextType>;
  mask_disable?: Mask_DisableDirectiveResolver<any, any, ContextType>;
  mask_enable?: Mask_EnableDirectiveResolver<any, any, ContextType>;
  optimisticKey?: OptimisticKeyDirectiveResolver<any, any, ContextType>;
  paginate?: PaginateDirectiveResolver<any, any, ContextType>;
  parentID?: ParentIdDirectiveResolver<any, any, ContextType>;
  prepend?: PrependDirectiveResolver<any, any, ContextType>;
  required?: RequiredDirectiveResolver<any, any, ContextType>;
  when?: WhenDirectiveResolver<any, any, ContextType>;
  when_not?: When_NotDirectiveResolver<any, any, ContextType>;
  with?: WithDirectiveResolver<any, any, ContextType>;
};
